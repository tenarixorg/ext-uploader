export interface Mandatory {
  name: string;
  lang: string;
  version: string;
}

export interface Optional {
  description?: string;
  homepage?: string;
  author?: string;
  readme?: string;
}

export interface Extension extends Mandatory, Optional {
  secret: string;
  tarball: string;
}

export interface Options {
  url?: string;
  path?: string;
  secret: string;
}

export interface UploadResponse {
  data: {
    ok: boolean;
    msg: string;
  };
  status: number;
}
