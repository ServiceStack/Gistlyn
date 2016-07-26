import { connect } from 'react-redux';

export const Config = {
    LatestVersion: "4.0.60",
};
export const StateKey = "/v1/state";
export const GistCacheKey = (gist) => `/v1/gists/${gist}`;

export const GistTemplates = {
    NewGist: "4fab2fa13aade23c81cabe83314c3cd0",
    NewPrivateGist: "7eaa8f65869fa6682913e3517bec0f7e",
    AddServiceStackReferenceGist: "eefea9cece5419f5d5dc24492d01c07c",
    HomeCollection: "2cc6b5db6afd3ccb0d0149e55fdb3a6a",
    Gists: ["4fab2fa13aade23c81cabe83314c3cd0", "7eaa8f65869fa6682913e3517bec0f7e",
        "eefea9cece5419f5d5dc24492d01c07c", "2cc6b5db6afd3ccb0d0149e55fdb3a6a"]
};

export const FileNames = {
    GistMain: "main.cs",
    GistPackages: "packages.config",
    CollectionIndex: "index.md"
};

export interface IGistMeta {
    id: string;
    description: string;
    public: boolean;
    created_at: string;
    updated_at: string;
    owner_login: string;
    owner_id: string;
    owner_avatar_url: string;
}

export interface IGistFile {
    size: number;
    raw_url: string;
    type: string;
    language: string;
    truncated: boolean;
    content: string;
}

export function reduxify(mapStateToProps, mapDispatchToProps?, mergeProps?, options?) {
    return target => (connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(target) as any);
}

const ua = navigator.userAgent;
export const UA = {
    ipad: ua.match(/iPad/i) != null,
    nosse: !("EventSource" in window),

    getClassList() {
        var cls = Object.keys(this).filter(k => this[k] === true);
        return cls.join(" ");
    }
};


export function getSortedFileNames(files) {
    const fileNames = Object.keys(files);
    fileNames.sort((a, b) => {
        if (a.toLowerCase() === "main.cs")
            return -1;
        if (b.toLowerCase() === "main.cs")
            return 1;
        if (!a.endsWith(".cs") && b.endsWith(".cs"))
            return 1;
        if (a === b)
            return 0;
        return a < b ? -1 : 0;
    });
    return fileNames;
};

export function addPackages(packagesConfig: string, pkgs: any[]) {
    var xml = "";
    pkgs.forEach(pkg => {
        if (!pkg.id || packagesConfig.indexOf(`"${pkg.id}"`) >= 0)
            return;

        var attrs = Object.keys(pkg).map(k => `${k}="${pkg[k]}"`);
        xml += "  <package " + attrs.join(" ") + " />\n";
    });

    return xml
        ? packagesConfig.replace("</packages>", "") + xml + "</packages>"
        : packagesConfig;
}

export function addClientPackages(packagesConfig: string) {
    return addPackages(packagesConfig, [
        { id: "ServiceStack.Client", version: Config.LatestVersion, targetFramework: "net45" },
        { id: "ServiceStack.Text", version: Config.LatestVersion, targetFramework: "net45" },
        { id: "ServiceStack.Interfaces", version: Config.LatestVersion, targetFramework: "net45" },
    ]);
}

