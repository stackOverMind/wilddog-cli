# wilddog-cli

在命令行中管理野狗数据库

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

  Options:

    -h, --help       output usage information
    -V, --version    output the version number
    --token <token>  use a token to login

wilddog doc: https://docs.wilddog.com
github: https://github.com/stackOverMind/wilddog-cli
```

## query

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

```
  Usage: update [options] [appid] [path] [data]

  merge data to the target path

  Options:

    -h, --help  output usage information

```

## remove

```
  Usage: remove [options] [appid] [path]

  remove data

  Options:

    -h, --help  output usage information
```