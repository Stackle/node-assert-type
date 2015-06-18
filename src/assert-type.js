// Generated by CoffeeScript 1.9.3
(function() {
  var $or, F, F_, T, Type, TypeAssertionError, TypeOf, TypedFun, TypedFunArgs, _, _F, addCompositeTypes, arrOfMulti, arrOfOne, assert, assert1, compileSimpleTypes, compositeTypes, cpsWrapperCallback, describeType, exportAll, fillPath, funOf, isInt, makeType, nameType, nativeAssert, objOf, s, simpleTypes, util;

  _ = require('underscore');

  util = require('util');

  nativeAssert = require('assert');

  TypeAssertionError = function(expected, actual) {
    this.message = 'expected ' + expected;
    this.expected = expected;
    this.actual = actual;
    return Error.captureStackTrace(this, this.constructor);
  };

  util.inherits(TypeAssertionError, nativeAssert.AssertionError);

  TypeAssertionError.prototype.name = 'TypeAssertionError';

  module.exports.TypeAssertionError = TypeAssertionError;

  Type = function() {};

  util.inherits(Type, Function);

  makeType = function(name, desc, test) {
    var ans, cons;
    cons = function() {};
    util.inherits(cons, Type);
    ans = (function(x) {
      return test(x);
    });
    ans.__proto__ = cons.prototype;
    ans.constructor = cons;
    ans.typeName = name;
    ans.typeDesc = desc;
    nativeAssert(_.isFunction(ans) && ans instanceof Function && ans instanceof Type && ans instanceof cons);
    return ans;
  };


  /*
  SIMPLE TYPES
   */

  isInt = function(x) {
    return _.isNumber(x) && !_.isNaN(x) && x > Number.NEGATIVE_INFINITY && x < Number.POSITIVE_INFINITY && Math.floor(x) === x;
  };

  TypedFun = function() {};

  util.inherits(TypedFun, Function);

  simpleTypes = {
    bool: ['boolean', _.isBoolean],
    num: ['number', _.isNumber],
    'num.not.nan': [
      'non-NaN number', (function(x) {
        return _.isNumber(x) && !_.isNaN(x);
      })
    ],
    'num.pos': [
      'positive number', (function(x) {
        return _.isNumber(x) && !_.isNaN(x) && x > 0;
      })
    ],
    'num.neg': [
      'negative number', (function(x) {
        return _.isNumber(x) && !_.isNaN(x) && x < 0;
      })
    ],
    'num.nonneg': [
      'nonnegative number', (function(x) {
        return _.isNumber(x) && !_.isNaN(x) && x >= 0;
      })
    ],
    'num.finite': [
      'finite number', (function(x) {
        return _.isNumber(x) && !_.isNaN(x) && x > Number.NEGATIVE_INFINITY && x < Number.POSITIVE_INFINITY;
      })
    ],
    'num.finite.pos': [
      'positive finite number', (function(x) {
        return _.isNumber(x) && !_.isNaN(x) && x > 0 && x < Number.POSITIVE_INFINITY;
      })
    ],
    'num.finite.neg': [
      'negative finite number', (function(x) {
        return _.isNumber(x) && !_.isNaN(x) && x < 0 && x > Number.NEGATIVE_INFINITY;
      })
    ],
    'num.finite.nonneg': [
      'nonnegative finite number', (function(x) {
        return _.isNumber(x) && !_.isNaN(x) && x >= 0 && x < Number.POSITIVE_INFINITY;
      })
    ],
    int: ['integer', isInt],
    'int.pos': [
      'positive integer', (function(x) {
        return isInt(x) && x > 0;
      })
    ],
    'int.neg': [
      'negative integer', (function(x) {
        return isInt(x) && x < 0;
      })
    ],
    'int.nonneg': [
      'nonnegative integer', (function(x) {
        return isInt(x) && x >= 0;
      })
    ],
    str: ['string', _.isString],
    'str.ne': [
      'nonempty string', (function(x) {
        return _.isString(x) && x.length > 0;
      })
    ],
    arr: ['array', _.isArray],
    'arr.ne': [
      'nonempty array', (function(x) {
        return _.isArray(x) && x.length > 0;
      })
    ],
    obj: [
      'object', (function(x) {
        return typeof x === 'object';
      })
    ],
    'obj.not.null': [
      'non-null object', (function(x) {
        return typeof x === 'object' && x !== null;
      })
    ],
    "null": [
      'null', (function(x) {
        return x === null;
      })
    ],
    undefined: [
      'undefined', (function(x) {
        return x === void 0;
      })
    ],
    defined: [
      'defined', (function(x) {
        return x !== void 0;
      })
    ],
    fun: ['function', _.isFunction],
    'fun.typed': [
      'typed function', (function(x) {
        return x instanceof TypedFun;
      })
    ],
    any: [
      'anything', (function(x) {
        return true;
      })
    ],
    type: [
      'type', (function(x) {
        return x instanceof Type;
      })
    ]
  };

  fillPath = function(target, path, x) {
    var key;
    if (path.length === 1) {
      return target[path] = x;
    } else {
      key = path.shift();
      if (!(key in target)) {
        target[key] = {};
      }
      return fillPath(target[key], path, x);
    }
  };

  compileSimpleTypes = function() {
    var ans, desc, j, key, len, ref, test;
    ans = {};
    ref = _.keys(simpleTypes);
    for (j = 0, len = ref.length; j < len; j++) {
      key = ref[j];
      desc = simpleTypes[key][0];
      test = simpleTypes[key][1];
      fillPath(ans, key.split('.'), makeType(key, desc, test));
    }
    return ans;
  };

  s = compileSimpleTypes();


  /*
  Assert: given a type, return a function of one argument that throws
  TypeAssertionError if its argument is not of that type.
   */

  assert1 = function(ty) {
    if (!s.type(ty)) {
      throw new TypeAssertionError('type', ty);
    }
    return function(x) {
      if (ty(x)) {
        return x;
      }
      throw new TypeAssertionError(ty.typeDesc, x);
    };
  };

  assert = function() {
    var j, len, ty, tys;
    tys = Array.prototype.slice.call(arguments);
    if (tys.length <= 1) {
      return assert1(tys[0]);
    }
    for (j = 0, len = tys.length; j < len; j++) {
      ty = tys[j];
      if (!s.type(ty)) {
        throw new TypeAssertionError('type array', tys);
      }
    }
    return function() {
      var i, xs;
      xs = Array.prototype.slice.call(arguments);
      if (xs.length !== tys.length) {
        throw new TypeAssertionError('#{tys.length} value(s) to typecheck', xs);
      }
      i = 0;
      while (i < tys.length) {
        assert1(tys[i])(xs[i]);
        i++;
      }
      return xs;
    };
  };

  T = assert;


  /*
  COMPOSITE TYPES
   */

  $or = function() {
    var desc, name, tydescs, tynames, tys;
    tys = Array.prototype.slice.call(arguments);
    T(s.arr.ne)(tys);
    tys.forEach(T(s.type));
    tynames = tys.map(function(ty) {
      return ty.typeName;
    });
    name = "or(" + (tynames.join(', ')) + ")";
    tydescs = tys.map(function(ty) {
      return ty.typeDesc;
    });
    desc = "one of (" + (tydescs.join(', ')) + ")";
    return makeType(name, desc, function(x) {
      var j, len, ty;
      for (j = 0, len = tys.length; j < len; j++) {
        ty = tys[j];
        if (ty(x)) {
          return true;
        }
      }
      return false;
    });
  };

  arrOfOne = function(ne, ty) {
    return makeType("arr.of(" + ty.typeName + ")", ty.typeDesc + " array", function(x) {
      var item, j, len;
      if (ne) {
        if (!s.arr.ne(x)) {
          return false;
        }
      } else if (!s.arr(x)) {
        return false;
      }
      for (j = 0, len = x.length; j < len; j++) {
        item = x[j];
        if (!ty(item)) {
          return false;
        }
      }
      return true;
    });
  };

  arrOfMulti = function(tys) {
    var descs, names;
    tys.forEach(T(s.type));
    names = tys.map(function(ty) {
      return ty.typeName;
    });
    descs = tys.map(function(ty) {
      return ty.typeDesc;
    });
    return makeType("arr.of([" + (names.join(', ')) + "])", "[" + (descs.join(', ')) + "] array", function(x) {
      var i;
      if (!_.isArray(x) || x.length !== tys.length) {
        return false;
      }
      i = 0;
      while (i < tys.length) {
        if (!tys[i](x[i])) {
          return false;
        }
        i++;
      }
      return true;
    });
  };

  objOf = function(only, proto) {
    var descItems, fd, fn, j, key, len, nameItems, protoKeys;
    T(s.bool, s.obj.not["null"])(only, proto);
    protoKeys = _.keys(proto);
    nameItems = [];
    descItems = [];
    for (j = 0, len = protoKeys.length; j < len; j++) {
      key = protoKeys[j];
      T(s.type)(proto[key]);
      nameItems.push(key + ": " + proto[key].typeName);
      descItems.push(key + ": " + proto[key].typeDesc);
    }
    fn = only ? 'obj.of' : 'obj.with';
    fd = only ? 'object' : '>=object';
    return makeType(fn + "({" + (nameItems.join(', ')) + "})", "{" + (descItems.join(', ')) + "} " + fd, function(x) {
      var k, len1, xKeys;
      if (!_.isObject(x)) {
        return false;
      }
      xKeys = _.keys(x);
      if (only && _.keys(x).length !== protoKeys.length) {
        return false;
      }
      for (k = 0, len1 = protoKeys.length; k < len1; k++) {
        key = protoKeys[k];
        if (!proto[key](x[key])) {
          return false;
        }
      }
      return true;
    });
  };

  funOf = function(args, ret) {
    var ty, tydesc, tyname;
    T(arrOfOne(false, s.type), s.type)(args, ret);
    tyname = "fun.of([" + (args.map(function(ty) {
      return ty.typeName;
    }).join(', ')) + "], " + ret.typeName + ")";
    tydesc = "(" + (args.map(function(ty) {
      return ty.typeDesc;
    }).join(', ')) + ") -> " + ret.typeDesc;
    ty = makeType(tyname, tydesc, function(x) {
      if (!s.fun.typed(x)) {
        return false;
      }
      return tyname === x.__funType__.typeName;
    });
    ty.sig = {
      args: args,
      ret: ret
    };
    return ty;
  };

  compositeTypes = {
    'or': $or,
    funN: function(N) {
      T(s.int.nonneg)(N);
      return makeType("funN(" + N + ")", N + "-ary function", function(x) {
        return s.fun(x) && x.length === N;
      });
    },
    'inst.of': function(Cons) {
      T(s.fun)(Cons);
      return makeType("inst.of(...)", "instance of a specific constructor", function(x) {
        return s.obj(x) && (x instanceof Cons);
      });
    },
    'arr.of': function(ty) {
      T($or(s.type, s.arr))(ty);
      if (s.type(ty)) {
        return arrOfOne(false, ty);
      } else {
        return arrOfMulti(ty);
      }
    },
    'arr.ne.of': function(ty) {
      T(s.type)(ty);
      return arrOfOne(true, ty);
    },
    'obj.of': (function(proto) {
      return objOf(true, proto);
    }),
    'obj.with': (function(proto) {
      return objOf(false, proto);
    }),
    'fun.of': funOf
  };

  addCompositeTypes = function(ans) {
    var j, key, len, ref;
    ref = _.keys(compositeTypes);
    for (j = 0, len = ref.length; j < len; j++) {
      key = ref[j];
      fillPath(ans, key.split('.'), compositeTypes[key]);
    }
    return ans;
  };

  TypedFunArgs = function() {
    var ans, args, fnty;
    args = Array.prototype.slice.call(arguments);
    T($or(arrOfMulti([s.type, s.fun]), arrOfMulti([arrOfOne(false, s.type), s.type, s.fun])))(args);
    if (args.length === 2) {
      fnty = args[0];
      if (!objOf(false, {
        sig: objOf(false, {
          args: arrOfOne(false, s.type),
          ret: s.type
        })
      })({
        sig: fnty.sig
      })) {
        throw new TypeAssertionError("function type (fun or fun.of(...))", fnty);
      }
      ans = {
        args_ty: fnty.sig.args,
        ret_ty: fnty.sig.ret,
        fn: args[1]
      };
    } else {
      ans = {
        args_ty: args[0],
        ret_ty: args[1],
        fn: args[2]
      };
    }
    if (ans.fn.length !== ans.args_ty.length) {
      throw new TypeAssertionError("function of " + ans.args_ty.length + " arguments for TypedFun", ans.fn.length);
    }
    return ans;
  };

  F = function() {
    var args_ty, fn, ref, ret_ty, wrapper;
    ref = TypedFunArgs.apply(this, arguments), args_ty = ref.args_ty, ret_ty = ref.ret_ty, fn = ref.fn;
    wrapper = function() {
      T(arrOfMulti(args_ty))(Array.prototype.slice.call(arguments));
      return T(ret_ty)(fn.apply(this, arguments));
    };
    wrapper.__proto__ = TypedFun.prototype;
    wrapper.constructor = TypedFun;
    wrapper.__funType__ = funOf(args_ty, ret_ty);
    nativeAssert(_.isFunction(wrapper) && wrapper instanceof Function && wrapper instanceof TypedFun);
    return wrapper;
  };

  cpsWrapperCallback = function(ret_ty, kont) {
    return function(err, ans) {
      var tyErr;
      if (err != null) {
        return kont(err);
      }
      try {
        T(ret_ty)(ans);
      } catch (_error) {
        tyErr = _error;
        return kont(tyErr);
      }
      return kont(err, ans);
    };
  };

  F_ = function(args_ty, ret_ty, fn) {
    var ref, wrapper;
    ref = TypedFunArgs.apply(this, arguments), args_ty = ref.args_ty, ret_ty = ref.ret_ty, fn = ref.fn;
    if (args_ty.length < 1 || !/fun.*/.test(args_ty[args_ty.length - 1].typeName)) {
      throw new TypeAssertionError("function type (fun.of(...)) as last argument in signature provided to TypedFun_", args_ty);
    }
    wrapper = function() {
      var wrapper_args;
      wrapper_args = Array.prototype.slice.call(arguments);
      T(arrOfMulti(args_ty))(wrapper_args);
      wrapper_args.push(cpsWrapperCallback(ret_ty, wrapper_args.pop()));
      return fn.apply(this, wrapper_args);
    };
    wrapper.__proto__ = TypedFun.prototype;
    wrapper.constructor = TypedFun;
    wrapper.__funType__ = funOf(args_ty, ret_ty);
    nativeAssert(_.isFunction(wrapper) && wrapper instanceof Function && wrapper instanceof TypedFun);
    return wrapper;
  };

  _F = function(args_ty, ret_ty, fn) {
    var ref, wrapper;
    ref = TypedFunArgs.apply(this, arguments), args_ty = ref.args_ty, ret_ty = ref.ret_ty, fn = ref.fn;
    if (args_ty.length < 1 || !/fun.*/.test(args_ty[0].typeName)) {
      throw new TypeAssertionError("function type (fun.of(...)) as first argument in signature provided to TypedFun_", args_ty);
    }
    wrapper = function() {
      var wrapper_args;
      wrapper_args = Array.prototype.slice.call(arguments);
      T(arrOfMulti(args_ty))(wrapper_args);
      wrapper_args.unshift(cpsWrapperCallback(ret_ty, wrapper_args.shift()));
      return fn.apply(this, wrapper_args);
    };
    wrapper.__proto__ = TypedFun.prototype;
    wrapper.constructor = TypedFun;
    wrapper.__funType__ = funOf(args_ty, ret_ty);
    nativeAssert(_.isFunction(wrapper) && wrapper instanceof Function && wrapper instanceof TypedFun);
    return wrapper;
  };

  nameType = F([s.type], s.str.ne, function(ty) {
    return ty.typeName;
  });

  describeType = F([s.type], s.str.ne, function(ty) {
    return ty.typeDesc;
  });

  TypeOf = F([s.any], s.type, function(x) {
    switch (typeof x) {
      case "function":
        if (s.fun.typed(x)) {
          return x.__funType__;
        }
        return s.fun;
      case "object":
        return s.obj;
      case "boolean":
        return s.bool;
      case "undefined":
        return s.undefined;
      case "string":
        return s.str;
      case "number":
        return s.num;
      default:
        throw Error('unrecognized result of typeof: ' + (typeof x));
    }
  });


  /*
  EXPORTS
   */

  exportAll = function() {
    module.exports.Type = Type;
    _.extend(module.exports, s);
    addCompositeTypes(module.exports, s);
    module.exports.Assert = assert;
    module.exports.TypeAssertionError = TypeAssertionError;
    module.exports.WrapFun = F;
    module.exports.WrapFun_ = F_;
    module.exports._WrapFun = _F;
    module.exports.TypeOf = TypeOf;
    module.exports.Name = nameType;
    return module.exports.Describe = describeType;
  };

  exportAll();

}).call(this);
