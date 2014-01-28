macro __handler {

  case { _ { $body ... } } => {
    letstx $req = [makeIdent("req", #{$body ...}[0])];
    letstx $res = [makeIdent("res", #{$body ...}[0])];
    letstx $bodyVal = [makeIdent("body", #{$body ...}[0])];
    letstx $nextVal = [makeIdent("nextVal", #{$body ...}[0])];
    letstx $next = [makeIdent("next", #{$body ...}[0])];
    letstx $header = [makeIdent("header", #{$body ...}[0])];
    letstx $send = [makeIdent("send", #{$body ...}[0])];
    letstx $write = [makeIdent("write", #{$body ...}[0])];
    letstx $end = [makeIdent("end", #{$body ...}[0])];
    letstx $accessQuery = [makeIdent("?", #{$body ...}[0])];
    letstx $accessParam = [makeIdent("~", #{$body ...}[0])];

    return #{
      function($req, $res, $nextVal) {
        let $header = macro {
          case { $id $name:expr, $val:expr } => {
            letstx $ires = [makeIdent("res", #{$id}[0])];
            return #{$ires.setHeader($name, $val)}
          }
        }
        let $send = macro {
          case { $id $arg $[(,)] $[...] } => {
            letstx $ires = [makeIdent("res", #{$id}[0])];
            return #{$ires.send($arg $[(,)] $[...])}
          }
        }
        let $write = macro {
          case { $id $arg $[(,)] $[...] } => {
            letstx $ires = [makeIdent("res", #{$id}[0])];
            return #{$ires.write($arg $[(,)] $[...])}
          }
        }
        let $end = macro {
          case { $id } => {
            letstx $ires = [makeIdent("res", #{$id}[0])];
            return #{$ires.end()}
          }
        }
        let $next = macro {
          case { $id } => {
            letstx $nextVal = [makeIdent("nextVal", #{$id}[0])];
            return #{$nextVal()}
          }
        }
        let $bodyVal = macro {
          case { $id } => {
            letstx $ireq = [makeIdent("req", #{$id}[0])];
            return #{$ireq.body}
          }
        }
        let $accessQuery = macro {
          case { $id $name:ident } => {
            letstx $ireq = [makeIdent("req", #{$id}[0])];
            return #{$ireq.query.$name}
          }
        }
        let $accessParam = macro {
          case { $id $name:ident } => {
            letstx $ireq = [makeIdent("req", #{$id}[0])];
            return #{$ireq.params.$name}
          }
        }

        $body ...
      }
    }
  }
}

macro expressApp {

  case { $name { $body ... } } => {
    letstx $app = [makeIdent("app", #{$name})];
    letstx $use = [makeIdent("use", #{$name})];
    letstx $get = [makeIdent("get", #{$name})];
    letstx $post = [makeIdent("post", #{$name})];
    letstx $put = [makeIdent("put", #{$name})];
    letstx $delete = [makeIdent("delete", #{$name})];

    return #{
      (function() {
        var $app = require('express');

        let $use = macro {
          rule { $path:expr { $mbody $[...] } } => {
            $app.use($path, __handler { $mbody $[...] })
          }
          rule { { $mbody $[...] } } => {
            $app.use(__handler { $mbody $[...] })
          }
          rule { $path:expr , $what:expr } => {
            $app.use($path , $what)
          }
          rule { $what:expr } => {
            $app.use($what)
          }
        }

        let $get = macro {
          rule { $path:expr { $mbody $[...] } } => {
            $app.get($path, __handler { $mbody $[...] })
          }
        }

        let $post = macro {
          rule { $path:expr { $mbody $[...] } } => {
            $app.post($path, __handler { $mbody $[...] })
          }
        }

        let $put = macro {
          rule { $path:expr { $mbody $[...] } } => {
            $app.put($path, __handler { $mbody $[...] })
          }
        }

        let $delete = macro {
          rule { $path:expr { $mbody $[...] } } => {
            $app.del($path, __handler { $mbody $[...] })
          }
        }


        $body ...

        return $app;
      })()
    }
  }
}

var app = expressApp {

  use {
    header "Content-type", "application/json"
    next
  }

  get "/users" {
    write "hello"
    write "more data"
    end
  }

  get "/users/:username" {
    db.search(~username);
  }

  put "/users/:username" {
    db.updateUser(~username, body, function(err, updated) {
      send updated
    });
  }

  get "/search" {
    db.search(?query);
  }
}
