# wilddog-cli

提供在命令行中管理数据，查询数据的功能，并且能够修改安全规则表达式。

## 安装

```
npm install -g wilddog-cli
```

## 使用

```

  Usage: wilddog [options] [command]


  Commands:

    set [options] [appid] [path] [data]  set data to the target path
    update [appid] [path] [data]         merge data to the target path
    push [appid] [path] [data]           add one child with an automate generated key
    remove [appid] [path]                remove data
    query [options] [appid] [path] 
    rules [options] [appid]    

  Options:

    -h, --help       output usage information
    -V, --version    output the version number
    --token <token>  use a token to login

wilddog doc: https://docs.wilddog.com
github: https://github.com/stackOverMind/wilddog-cli
```

## query

查询操作

```
  Usage: wilddog query [options] [appid] [path]

  Options:

    -h, --help               output usage information
    -o --one                 once
    -e --event <event>       event type,the value can be one of :value, child_added, child_changed, child_moved,child_removed
    --orderByChild <child>   orderByChild
    --orderByValue           orderByValue
    --orderByPriority        orderByPriority
    --startAt <start>        start Position
    --endAt <end>            end Position
    --equalTo <eq>           equal to a value
    --limitToFirst <number>  limit to first
    --limitToLast <number>   limit to last
```

eg.

```
wilddog query test123 / --orderByValue  -e child_added

```

## set
设置数据

```
  Usage: set [options] [appid] [path] [data]

  set data to the target path

  Options:

    -h, --help             output usage information
    --priority <priority>  set with a priority

```

eg.

```sh
wilddog set appid /a/b/c '{"name":"~~~"}' 

wilddog set appid /a/b/c 'hello world'

wilddog set appid /a/b/c 12345

wilddog set appid /a/b/c true

```

## push
push新数据节点

```
  Usage: push [options] [appid] [path] [data]

  add one child with an automate generated key

  Options:

    -h, --help  output usage information
```

eg.

```sh
wilddog push appid /a/b/c new-item

```

## update
更新数据

```
  Usage: update [options] [appid] [path] [data]

  merge data to the target path

  Options:

    -h, --help  output usage information

```

eg
```
wilddog update test123 /path1/path2 {"name":"ppap"}
```

## remove
删除数据

```
  Usage: remove [options] [appid] [path]

  remove data

  Options:

    -h, --help  output usage information
```

## rules

#### 获取安全规则

```
wilddog rules --secret <your-secret>
```

#### 上传安全规则

```sh
wilddog rules --set ./rules.json --secret <your-secret>
```

 rules.json 是你的安全规则表达式文件
```json
{
    "rules": {
        ".read": true,
        ".write": true
    }
}
```

# TODO

* 测试安全规则
* 客户端校验安全规则语法以及类型合法性
* 导入数据
* 导出数据
* 导出用户
* deploy解决方案