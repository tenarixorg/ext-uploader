import ora from "ora";
import pack from "npm-packlist";
import axios from "axios";
import FormData from "form-data";
import { createReadStream } from "fs";
import { join, resolve } from "path";
import { readFileSync } from "fs";
import { create } from "tar";
import {
  Options,
  Optional,
  Extension,
  Mandatory,
  UploadResponse,
} from "./types";

const getErrors = (extension: Mandatory) => {
  const errors = [];
  if (!extension.name) {
    errors.push("name");
  }
  if (!extension.lang) {
    errors.push("lang");
  }
  if (!extension.version) {
    errors.push("version");
  }
  return errors;
};

export const packExtension = async (
  path: string,
  secret: string
): Promise<Extension | undefined> => {
  const path_ = resolve(path);
  try {
    const packageJson = JSON.parse(
      readFileSync(`${path_}/package.json`, "utf8")
    ) as Mandatory & Optional;
    const readme = readFileSync(`${path_}/README.md`, "utf8");
    const errors = getErrors(packageJson);
    const eL = errors.length;
    if (!secret) {
      ora("secret is required").fail();
      return;
    }
    if (eL > 0) {
      const rest = "missing in package.json";
      ora(`${errors.join(", ")} ${eL === 1 ? "is" : "are"} ${rest}`).fail();
      return;
    }
    const spinner = ora("Creating tarball...").start();
    const data: Extension = {
      name: packageJson.name,
      lang: packageJson.lang,
      version: packageJson.version,
      description: packageJson?.description || "",
      secret: secret,
      homepage: packageJson?.homepage || "",
      readme: readme || "",
      author: packageJson?.author || "",
      tarball: "",
    };
    const fullPath = join(path_, data.name + ".tgz");
    try {
      const files = await pack({
        path,
      });
      await create(
        {
          prefix: data.name,
          cwd: path_,
          gzip: true,
          file: data.name + ".tgz",
        },
        files
      );
      spinner.succeed(`Tarball created: ${fullPath}`);
      return {
        ...data,
        tarball: fullPath,
      };
    } catch (error: any) {
      spinner.fail(error.message);
      return;
    }
  } catch (error: any) {
    ora(error.message).fail();
    return;
  }
};

const getFormData = (data: Extension) => {
  const formData = new FormData();
  for (const key of Object.keys(data)) {
    if (key === "tarball") {
      formData.append(key, createReadStream(data[key]));
    } else {
      formData.append(key, (data as any)[key]);
    }
  }
  return formData;
};

const upload = async (url: string, data: FormData) => {
  const spinner = ora("Uploading extension...").start();
  try {
    const res = await axios.post(url, data, {
      headers: {
        ...data.getHeaders(),
      },
    });
    if (res.data.ok) {
      spinner.succeed(res.data.msg);
    }
    return {
      data: res.data,
      status: res.status,
    };
  } catch (error: any) {
    const data = error.response.data;
    spinner.fail(data.msg);
    return {
      data,
      status: error.response.status,
    };
  }
};

export const addExtension = async (
  options: Options
): Promise<UploadResponse | undefined> => {
  const path = options.path || "./";
  const url = options.url || "http://localhost:4000/api/v1/extension/add";
  const res = await packExtension(path, options.secret);
  if (res) {
    const formData = getFormData(res);
    const response = await upload(url, formData);
    return response;
  }
  return undefined;
};
