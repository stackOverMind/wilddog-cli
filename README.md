# wilddog-cli

## TODO

wilddog init <configFile>

wilddog data --set <data> --path <path>
wilddog data --push <data> --path <path>
wilddog data --update <data> --path <path>
wilddog data --remove <data> --path <path>
wilddog data --listen --path <path>
wilddog test --set <data> --path <path> --authToken

wilddog deploy --conf <file>

`wilddog.json`

```json
"appid": "test123",
"rules":{
    ".write":"true",
    ".read":"true"
},
"auth":{
    "password":{

    },
    "anonymously":{

    }
    ...
},
"assets":{
    "type":"qiniu",
    "bucket":...
}

```


