import { describe, expect, test } from "bun:test"
import { DocFileSystemOctokit } from "./doc-file-system-octokit"

describe("DocFileSystemOctokit", () => {
  test("コンストラクタでインスタンス化できる", () => {
    const fileSystem = new DocFileSystemOctokit({
      owner: "owner",
      repo: "repo",
      token: "token",
      basePath: "docs",
    })

    expect(fileSystem).toBeInstanceOf(DocFileSystemOctokit)
  })

  test("branch を省略すると main になる", () => {
    const fileSystem = new DocFileSystemOctokit({
      owner: "owner",
      repo: "repo",
      token: "token",
      basePath: "docs",
    })

    expect(fileSystem.branch).toBe("main")
  })

  test("owner / repo / branch を公開する", () => {
    const fileSystem = new DocFileSystemOctokit({
      owner: "owner",
      repo: "repo",
      token: "token",
      basePath: "docs",
      branch: "develop",
    })

    expect(fileSystem.owner).toBe("owner")
    expect(fileSystem.repo).toBe("repo")
    expect(fileSystem.branch).toBe("develop")
  })
})
