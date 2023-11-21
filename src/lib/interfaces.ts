export interface IPastebinOptions {
  api_dev_key?: null | string;
  api_user_key?: null | string;
  api_user_name?: null | string;
  api_user_password?: null | string;
  debug?: boolean;
}

export enum PrivacyLevel {
  PUBLIC_ANONYMOUS = 0,
  UNLISTED = 1,
  PRIVATE = 2,
  PUBLIC_USER = 3,
}

export enum ExpirationTime {
  NEVER = "N",
  TEN_MINUTES = "10M",
  ONE_HOUR = "1H",
  ONE_DAY = "1D",
  ONE_WEEK = "1W",
  TWO_WEEKS = "2W",
  ONE_MONTH = "1M",
  SIX_MONTHS = "6M",
  ONE_YEAR = "1Y",
}

export type FormatType =
  | "4cs"
  | "6502acme"
  | "6502kickass"
  | "6502tasm"
  | "abap"
  | "actionscript"
  | "actionscript3"
  | "ada"
  | "aimms"
  | "algol68"
  | "apache"
  | "applescript"
  | "apt_sources"
  | "arduino"
  | "arm"
  | "asm"
  | "asp"
  | "asymptote"
  | "autoconf"
  | "autohotkey"
  | "autoit"
  | "avisynth"
  | "awk"
  | "bascomavr"
  | "bash"
  | "basic4gl"
  | "dos"
  | "bibtex"
  | "b3d"
  | "blitzbasic"
  | "bmx"
  | "bnf"
  | "boo"
  | "bf"
  | "c"
  | "csharp"
  | "c_winapi"
  | "cpp"
  | "cpp-winapi"
  | "cpp-qt"
  | "c_loadrunner"
  | "caddcl"
  | "cadlisp"
  | "ceylon"
  | "cfdg"
  | "c_mac"
  | "chaiscript"
  | "chapel"
  | "cil"
  | "clojure"
  | "klonec"
  | "klonecpp"
  | "cmake"
  | "cobol"
  | "coffeescript"
  | "cfm"
  | "css"
  | "cuesheet"
  | "d"
  | "dart"
  | "dcl"
  | "dcpu16"
  | "dcs"
  | "delphi"
  | "oxygene"
  | "diff"
  | "div"
  | "dot"
  | "e"
  | "ezt"
  | "ecmascript"
  | "eiffel"
  | "email"
  | "epc"
  | "erlang"
  | "euphoria"
  | "fsharp"
  | "falcon"
  | "filemaker"
  | "fo"
  | "f1"
  | "fortran"
  | "freebasic"
  | "freeswitch"
  | "gambas"
  | "gml"
  | "gdb"
  | "gdscript"
  | "genero"
  | "genie"
  | "gettext"
  | "go"
  | "godot-glsl"
  | "groovy"
  | "gwbasic"
  | "haskell"
  | "haxe"
  | "hicest"
  | "hq9plus"
  | "html4strict"
  | "html5"
  | "icon"
  | "idl"
  | "ini"
  | "inno"
  | "intercal"
  | "io"
  | "ispfpanel"
  | "j"
  | "java"
  | "java5"
  | "javascript"
  | "jcl"
  | "jquery"
  | "json"
  | "julia"
  | "kixtart"
  | "kotlin"
  | "ksp"
  | "latex"
  | "ldif"
  | "lb"
  | "lsl2"
  | "lisp"
  | "llvm"
  | "locobasic"
  | "logtalk"
  | "lolcode"
  | "lotusformulas"
  | "lotusscript"
  | "lscript"
  | "lua"
  | "m68k"
  | "magiksf"
  | "make"
  | "mapbasic"
  | "markdown"
  | "matlab"
  | "mercury"
  | "metapost"
  | "mirc"
  | "mmix"
  | "mk-61"
  | "modula2"
  | "modula3"
  | "68000devpac"
  | "mpasm"
  | "mxml"
  | "mysql"
  | "nagios"
  | "netrexx"
  | "newlisp"
  | "nginx"
  | "nim"
  | "nsis"
  | "oberon2"
  | "objeck"
  | "objc"
  | "ocaml"
  | "ocaml-brief"
  | "octave"
  | "pf"
  | "glsl"
  | "oorexx"
  | "oobas"
  | "oracle8"
  | "oracle11"
  | "oz"
  | "parasail"
  | "parigp"
  | "pascal"
  | "pawn"
  | "pcre"
  | "per"
  | "perl"
  | "perl6"
  | "phix"
  | "php"
  | "php-brief"
  | "pic16"
  | "pike"
  | "pixelbender"
  | "pli"
  | "plsql"
  | "postgresql"
  | "postscript"
  | "povray"
  | "powerbuilder"
  | "powershell"
  | "proftpd"
  | "progress"
  | "prolog"
  | "properties"
  | "providex"
  | "puppet"
  | "purebasic"
  | "pycon"
  | "python"
  | "pys60"
  | "q"
  | "qbasic"
  | "qml"
  | "rsplus"
  | "racket"
  | "rails"
  | "rbs"
  | "rebol"
  | "reg"
  | "rexx"
  | "robots"
  | "roff"
  | "rpmspec"
  | "ruby"
  | "gnuplot"
  | "rust"
  | "sas"
  | "scala"
  | "scheme"
  | "scilab"
  | "scl"
  | "sdlbasic"
  | "smalltalk"
  | "smarty"
  | "spark"
  | "sparql"
  | "sqf"
  | "sql"
  | "sshconfig"
  | "standardml"
  | "stonescript"
  | "sclang"
  | "swift"
  | "systemverilog"
  | "tsql"
  | "tcl"
  | "teraterm"
  | "texgraph"
  | "thinbasic"
  | "typescript"
  | "typoscript"
  | "unicon"
  | "uscript"
  | "upc"
  | "urbi"
  | "vala"
  | "vbnet"
  | "vbscript"
  | "vedit"
  | "verilog"
  | "vhdl"
  | "vim"
  | "vb"
  | "visualfoxpro"
  | "visualprolog"
  | "whitespace"
  | "whois"
  | "winbatch"
  | "xbasic"
  | "xml"
  | "xojo"
  | "xorg_conf"
  | "xpp"
  | "yaml"
  | "yara"
  | "z80"
  | "zxbasic"
  | null;

export interface ICreatePasteBaseOptions<T> {
  text?: string;
  file?: string | T;
  title?: string;
  format?: FormatType | string;
  privacy?: PrivacyLevel | number;
  expiration?: ExpirationTime | string | null;
}

export interface ICreatePasteTextOptions extends ICreatePasteBaseOptions<never> {
  text: string;
}

export interface ICreatePasteFileOptions<T> extends ICreatePasteBaseOptions<T> {
  file: string | T;
}

export interface IPasteAPIOptions {
  api_option: string;
  api_dev_key?: string;
  api_user_key?: string;
  api_paste_code?: string;
  api_paste_format?: FormatType;
  api_paste_expire_date?: ExpirationTime;
  api_paste_private?: number;
  api_results_limit?: number;
  api_paste_name?: string;
  api_paste_key?: string;
}

export interface Paste {
  paste_key: string;
  paste_date: number;
  paste_title: string;
  paste_size: number;
  paste_expire_date: number;
  paste_private: number;
  paste_format_long: string;
  paste_format_short: string;
  paste_url: string;
  paste_hits: number;
}

export interface User {
  user_name: string;
  user_format_short: string;
  user_expiration: string;
  user_avatar_url: string;
  user_private: number;
  user_website: string | null;
  user_email: string | null;
  user_location: string | null;
  user_account_type: number;
}
