module.exports = {
  branches: ['master'], // 指定在哪个分支下要执行发布操作
  plugins: [
    '@semantic-release/commit-analyzer', // 解析 commit 信息，默认就是 Angular 规范
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md' // 把发布日志写入该文件
      }
    ],
    '@semantic-release/npm',  // 发布到NPM
    '@semantic-release/github',
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json'] // 前面说到日志记录和版本好是新增修改的，需要 push 回 Git 
      }
    ]
  ]
}
