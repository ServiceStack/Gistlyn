import { connect } from 'react-redux';
import { JsonServiceClient } from 'servicestack-client';
import { GithubFile } from './Gistlyn.dtos';

export const Config = {
    LatestVersion: "4.0.60",
};
export const StateKey = "/v1/state";
export const GistCacheKey = (gist) => `/v1/gists/${gist}`;
export const client = new JsonServiceClient("/");

export const GistTemplates = {
    NewGist: "52c37e37b51a0ec92810477be34695ae",
    NewPrivateGist: "492e199fa3ec5394ef0bc1aedd3240c7",
    NewCollection:"854ec4df3502ecdfe9ca24d4745e484f",
    AddServiceStackReferenceGist: "2dbd4ccff70851ce8ae55678f4f15d0a",
    AddServiceStackReferenceCollection: "363605c3c121784ebababac4a03e8910",
    CollectionsCollection: "457a7035675513ba1365195658a5d792",
    SnapshotsCollection: "1576fda8eea87abbe94fa8051b4fed34",
    HomeCollection: "2cc6b5db6afd3ccb0d0149e55fdb3a6a",
    DownloadCollection: "74d7b0467a197f678bb4220b2c301ac3",
    RedisTodo: "54e452bb1e86e132068a595d7e72d1a6",
    OrmLiteTodo: "0cd558e817f28f77b974c44c3e12ff6f",
    PocoDynamoTodo: "d36339c55be6a43942a60c1eaf687bfd",
    Gists: ["52c37e37b51a0ec92810477be34695ae", "492e199fa3ec5394ef0bc1aedd3240c7", "854ec4df3502ecdfe9ca24d4745e484f",
        "2dbd4ccff70851ce8ae55678f4f15d0a", "363605c3c121784ebababac4a03e8910",
        "457a7035675513ba1365195658a5d792", "1576fda8eea87abbe94fa8051b4fed34",
        "2cc6b5db6afd3ccb0d0149e55fdb3a6a", "74d7b0467a197f678bb4220b2c301ac3",
        "54e452bb1e86e132068a595d7e72d1a6", "0cd558e817f28f77b974c44c3e12ff6f", "d36339c55be6a43942a60c1eaf687bfd"]
};

export const FileNames = {
    GistMain: "main.cs",
    GistPackages: "packages.config",
    CollectionIndex: "index.md",
    Snapshot: "snapshot.json"
};
export interface IGistRef {
    id: string;
    description: string;
    owner_login: string;
}
export interface IGistSaved {
    meta: IGistMeta;
    files: { [index: string]: IGistFile };
}
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
const platform = navigator.platform.toLowerCase();
export const UA = {
    ipad: ua.match(/iPad/i) != null,
    nosse: !("EventSource" in window),
    [platform]: true,
    mac: platform.indexOf("mac") >= 0,
    safari: /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor),

    getClassList() {
        var cls = Object.keys(this).filter(k => this[k] === true);
        return cls.join(" ");
    }
};

export function toGithubFiles(files:{ [index: string]: IGistFile }): { [index:string]: GithubFile; } {
    var fileContents = {} as { [index:string]: GithubFile; };
    Object.keys(files).forEach(fileName => {
        const file = new GithubFile();
        file.filename = fileName;
        file.content = files[fileName].content;
        fileContents[fileName] = file;
    });
    return fileContents;
}

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

export class BatchItems {
    everyMs: number;
    callback: (results: any[]) => void;
    results: any[];
    timeoutId: number;

    constructor(everyMs: number, callback: (results: any[]) => void) {
        this.everyMs = everyMs;
        this.callback = callback;
        this.results = [];
    }

    queue(result: any) {
        if (this.timeoutId == null) {
            this.results.push(result);
            this.callback(this.results); //return 1st result for instant feedback
            this.results = [];

            this.timeoutId = setTimeout(() => {
                var results = this.results;
                this.results = [];
                this.timeoutId = null;

                if (results.length > 0) {
                    this.callback(results);
                }

            }, this.everyMs);
        } else {
            this.results.push(result); //buffer results if timer is active
        }
    }
}


