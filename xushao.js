
/*核心框架*/
(function(window) {
  /*双对象法则 --- 第一个对象 链式访问的方法放到这个对象下*/
  var xushao = function(selector, context) {
    return this.init(selector, context)
  };
  /*
   *  初始化方法 --- 将选择到的元素保存到使用构造函数初始化时产生的匿名对象中。
   *  该匿名对象通过this引用。并将匿名对象变成一个伪数组。
   */
  xushao.prototype.init = function(selector, context) {
    var that = this;
    that.length = 0;
    if (!selector) {
      return that;
    }
    if (typeof selector === 'string') {
      var nodeList = (context || document).querySelectorAll(selector);
      that.length = nodeList.length;
      for (var i = 0; i < this.length; i += 1) {
        that[i] = nodeList[i];
      }
    } else if (selector.nodeType) {
      that[0] = selector;
      that.length++;
    }
    return that;
  };
  /*双对象法则 --- 第二个对象，将不需要链式访问的方法放在这个对象下
   * 如果selector是一个函数，则实现DOM加载完成后函数执行的效果。
   */
  var $$ = function(selector, context) {
    if (typeof selector == 'function') {
      window.onload = selector;
    } else {
      return new xushao(selector, context);
    }
  };
  /**
   * extend --- 扩展对象方法
   * 如果只传递一个参数，表示给Liugeng对象添加功能
   * 如果传递两个参数，表示给指定的对象添加功能
   */
  $$.extend = function() {
    var key, arg = arguments,
      i = 1,
      len = arg.length,
      target = null;
    if (len === 0) {
      return;
    } else if (len === 1) {
      target = xushao.prototype;
      i--;
    } else {
      target = arg[0];
    }
    for (; i < len; i++) {
      for (key in arg[i]) {
        target[key] = arg[i][key];
      }
    }
    return target;
  };

  // 将$ 和$$作为window属性暴露出去，给用户使用
  window.$$ = window.$ = $$;
})(window);

/*公共模块*/
(function($$) {
  /*需要链式访问*/
  $$.extend({
    // 将循环的方法抽取出来
    each: function(fn) {
      var i = 0,
        length = this.length;
      for (; i < length; i += 1) {
        fn.call(this[i]);
      }
      return this;
    }
  });

  /*不需要链式访问*/
  /*字符串类方法*/
  $$.extend($$, {
    // 转换为驼峰命名法
    camelCase: function(str) {
      return str.replace(/\-(\w)/g, function(all, letter) {
        return letter.toUpperCase();
      });
    },
    // 去除前后空格
    trim: function(str) {
      return str.replace(/^\s+|\s+$/g, '')
    },
    //去除左边空格
    ltrim: function(str) {
      return str.replace(/(^\s*)/g, '');
    },
    //去除右边空格
    rtrim: function(str) {
      return str.replace(/(\s*$)/g, '');
    },
    // 获取函数形参列表
    getFnParams: function(fn) {
      if (typeof fn !== 'function') {
        return false;
      }
      var matches = /.+\((.+)\)/.exec(fn.toString());
      var ps = matches[1].split(',');
      var res = [];
      ps.forEach(p => {
        res.push(p.trim());
      });
      return res;
    },
    //简单的数据绑定formateString
    formateString: function(str, data) {
      return str.replace(/@\((\w+)\)/g, function(match, key) {
        return typeof data[key] === "undefined" ? '' : data[key]
      });
    },
    //将json转换成字符串
    sjson: function(json) {
      return JSON.stringify(json);
    },
    //将字符串转成json
    json: function(str) {
      return eval(str);
    }
  });
  /*ajax*/
  $$.extend($$, {
    myAjax: function(URL, fn) {
      var xhr = createXHR(); //返回了一个对象，这个对象IE6兼容。
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
            fn(xhr.responseText);
          } else {
            alert("错误的文件！");
          }
        }
      };
      xhr.open("get", URL, true);
      xhr.send();

      //闭包形式，因为这个函数只服务于ajax函数，所以放在里面
      function createXHR() {
        //本函数来自于《JavaScript高级程序设计 第3版》第21章
        if (typeof XMLHttpRequest != "undefined") {
          return new XMLHttpRequest();
        } else if (typeof ActiveXObject != "undefined") {
          if (typeof arguments.callee.activeXString != "string") {
            var versions = ["MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.3.0",
                "MSXML2.XMLHttp"
              ],
              i, len;

            for (i = 0, len = versions.length; i < len; i++) {
              try {
                new ActiveXObject(versions[i]);
                arguments.callee.activeXString = versions[i];
                break;
              } catch (ex) {
                //skip
              }
            }
          }

          return new ActiveXObject(arguments.callee.activeXString);
        } else {
          throw new Error("No XHR object available.");
        }
      }
    },
  });
  /*Math*/
  $$.extend($$, {
    //随机数
    random: function(begin, end) {
      return Math.floor(Math.random() * (end - begin)) + begin;
    },
  });
  /*数据类型校验*/
  $$.extend($$, {
    //数据类型检测
    isNumber: function(val) {
      return typeof val === 'number' && isFinite(val)
    },
    isBoolean: function(val) {
      return typeof val === "boolean";
    },
    isString: function(val) {
      return typeof val === "string";
    },
    isUndefined: function(val) {
      return typeof val === "undefined";
    },
    isObj: function(str) {
      if (str === null || typeof str === 'undefined') {
        return false;
      }
      return typeof str === 'object';
    },
    isNull: function(val) {
      return val === null;
    },
    isArray: function(arr) {
      if (arr === null || typeof arr === 'undefined') {
        return false;
      }
      return arr.constructor === Array;
    }
  });
})($$);

/*事件模块*/
(function($$) {
  /*需要参与链式访问*/
  $$.extend({
    // 添加事件
    on: function(type, fn) {
      var i = this.length - 1;
      if (document.addEventListener) {
        for (; i >= 0; i--) {
          this[i].addEventListener(type, fn, false);
        }
      } else if (document.attachEvent) {
        for (; i >= 0; i--) {
          this[i].attachEvent('on' + type, fn);
        }
      } else {
        for (; i >= 0; i--) {
          this[i]['on' + type] = fn;
        }
      }
      return this;
    },
    // 解除事件
    un: function(type, fn) {
      var i = this.length - 1;
      if (document.removeEventListener) {
        for (; i >= 0; i--) {
          this[i].removeEventListener(type, fn);
        }
      } else if (document.detachEvent) {
        for (; i >= 0; i--) {
          this[i].attachEvent('on' + type, fn);
        }
      } else {
        for (; i >= 0; i--) {
          this[i]['on' + type] = null;
        }
      }
      return this;
    },
    // 点击事件
    click: function(fn) {
      this.on('click', fn);
      return this;
    },
    // 鼠标移入事件
    mouseover: function(fn) {
      this.on('mouseover', fn);
      return this;
    },
    // 鼠标移出事件
    mouseout: function(fn) {
      this.on('mouseout', fn);
      return this;
    },
    // 鼠标悬浮事件
    hover: function(fnOver, fnOut) {
      var i = 0;
      for (i = 0; i < this.length; i++) {
        if (fnOver) {
          this.on("mouseover", fnOver);
        }
        if (fnOut) {
          this.on("mouseout", fnOut);
        }
      }

      return this;
    },
    // 时间切换
    toggle: function() {
      var that = this;
      var _arguments = arguments;

      for (var i = 0; i < this.length; i++) {
        addToggle(this[i]);
      }

      function addToggle(obj) {
        var count = 0;
        that.on('click', function() {
          _arguments[count++ % _arguments.length].call(obj);
        });
      }
    }
  });
  /*不需要参加链式访问*/
  $$.extend($$, {
    // 获取事件对象 --- 兼容ie
    getEvent: function(event) {
      return event ? event : window.event;
    },
    // 获取目标元素 --- 兼容ie
    getTarget: function(event) {
      var event = this.getEvent(event);
      return event.target || event.srcElement;
    },
    // 阻止冒泡 --- 兼容ie
    stopPropagation: function(event) {
      var event = this.getEvent(event);
      if (event.stopPropagation) {
        event.stopPropagation();
      } else {
        event.cancelBubble = true;
      }
    },
    // 阻止默认事件
    preventDefault: function(event) {
      var event = this.getEvent(event);
      if (event.preventDefault) {
        event.preventDefault();
      } else {
        event.returnValue = false;
      }
    },
    getDetail: function(event) {
      var event = this.getEvent(event);
      if (event.wheelDelta) {
        return event.wheelDelta;
      } else {
        return -event.detail * 40;
      }
    }
  });
})($$);

/*css模块*/
(function($$) {
  //css样式框架
  $$.extend({
    css: function() {
      var arg = arguments,
        len = arg.length;
      if (this.length < 1) {
        return this;
      }
      if (len === 1) {
        if (typeof arg[0] === 'string') {
          if (this[0].currentStyle) {
            return this[0].currentStyle[arg[0]];
          } else {
            return getComputedStyle(this[0], false)[arg[0]];
          }
        } else if (typeof arg[0] === 'object') {
          for (var i in arg[0]) {
            for (var j = this.length - 1; j >= 0; j--) {
              this[j].style[$$.camelCase(i)] = arg[0][i];
            }
          }
        }
      } else if (len === 2) {
        for (var j = this.length - 1; j >= 0; j--) {
          this[j].style[$$.camelCase(arg[0])] = arg[1];
        }
      }
      return this;
    },
    /*hide*/
    hide: function() {
      this.each(function() {
        this.style.display = "none";
      });
    },
    /*show*/
    show: function() {
      this.each(function() {
        this.style.display = "block";
      });
    },
    //元素高度宽度概述
    //计算方式：clientHeight clientWidth innerWidth innerHeight
    //元素的实际高度+border，也不包含滚动条
    width: function() {
      return this[0].clientWidth
    },
    height: function() {
      return this[0].clientHeight
    },

    //元素的滚动高度和宽度
    //当元素出现滚动条时候，这里的高度有两种：可视区域的高度 实际高度（可视高度+不可见的高度）
    //计算方式 scrollwidth
    scrollWidth: function() {
      return this[0].scrollWidth
    },
    scrollHeight: function() {
      return this[0].scrollHeight
    },

    //元素滚动的时候 如果出现滚动条 相对于左上角的偏移量
    //计算方式 scrollTop scrollLeft
    scrollTop: function() {
      return this[0].scrollTop
    },
    scrollLeft: function() {
      return this[0].scrollLeft
    },
  });
  /*不需要链式访问*/
  $$.extend($$, {
    //获取屏幕的高度和宽度
    screenHeight: function() {
      return window.screen.height
    },
    screenWidth: function() {
      return window.screen.width
    },

    //文档视口的高度和宽度
    wWidth: function() {
      return document.documentElement.clientWidth
    },
    wHeight: function() {
      return document.documentElement.clientHeight
    },
    //文档滚动区域的整体的高和宽
    wScrollHeight: function() {
      return document.body.scrollHeight
    },
    wScrollWidth: function() {
      return document.body.scrollWidth
    },
    //获取滚动条相对于其顶部的偏移
    wScrollTop: function() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
      return scrollTop
    },
    //获取滚动条相对于其左边的偏移
    wScrollLeft: function() {
      var scrollLeft = document.body.scrollLeft || (document.documentElement && document.documentElement.scrollLeft);
      return scrollLeft
    }
  });
})($$);

/*属性内容模块*/
(function($$) {
  //属性
  $$.extend({
    attr: function() {
      var arg = arguments,
        len = arg.length;
      if (this.length < 1) {
        return this;
      }
      if (len === 1) {
        if (typeof arg[0] === 'string') {
          return this[0].getAttribute(arg[0]);
        } else if (typeof arg[0] === 'object') {
          for (var i in arg[0]) {
            for (var j = this.length - 1; j >= 0; j--) {
              this[j].setAttribute(i, arg[0][i]);
            }
          }
        }
      } else if (len === 2) {
        for (var j = this.length - 1; j >= 0; j--) {
          this[j].setAttribute(arg[0], arg[1]);
        }
      }
      return this;
    },
    hasClass: function(val) {
      if (!this[0]) {
        return;
      }
      var value = $$.trim(val);
      console.log('测试属性' + value)
      return this[0].className.indexOf(value) >= 0 ? true : false;
    },
    addClass: function(val) {
      console.log('测试属性' + val)
      var value = $$.trim(val),
        str = '';
      for (var i = 0, len = this.length; i < len; i++) {
        str = this[i].className;
        if (str.indexOf(value) < 0) {
          this[i].className += ' ' + value;
        }
      }
      return this;
    },
    removeClass: function(val) {
      console.log('测试属性' + val)
      var value = $$.trim(val);
      for (var i = 0, len = this.length; i < len; i++) {
        this[i].className = $$.trim(this[i].className.replace(value, ''));
      }
      return this;
    },
    toggleClass: function(val) {
      var value = $$.trim(val);
      for (var i = 0, len = this.length; i < len; i++) {
        if (this[i].className.indexOf(value) >= 0) {
          this[i].className = this[i].className.replace(value, '');
        } else {
          this[i].className += ' ' + value;
        }
      }
      return this;
    }
  });
  /*不需要链式访问*/
  $$.extend($$, {

  });

  //内容
  $$.extend({
    html: function() {
      var arg = arguments,
        len = arg.length;
      //如果用户使用html（），则表示获取元素的内容
      if (len === 0) {
        return this[0].innerHTML;
      } else if (len === 1) {
        //如果用户这样使用html（‘王书奎’），则以此遍历对象从第一个到倒数第二个
        //for(var i =0;i< this.length; i++){
        //this[i].innerHTML = arg[0];
        //}
        this.each(function() {
          this.innerHTML = arg[0]
        });
      }
      return this;
    },
    htmlOther: function() {
      var arg = arguments,
        len = arg.length;
      if (this.length < 1) {
        return this;
      }
      if (len === 0) {
        for (var i = this.length - 1; i >= 0; i--) {
          this[i].innerHTML = '';
        }
      } else if (len === 1) {
        for (var i = this.length - 1; i >= 0; i--) {
          this[i].innerHTML = arg[0];
        }
      } else if (len === 2 && arg[1]) {
        for (var i = this.length - 1; i >= 0; i--) {
          this[i].innerHTML += arg[0];
        }
      }
      return this;
    }
  });
  /*不需要链式访问*/
  $$.extend($$, {});
})($$);
/*常用DOM操作模块*/
(function($$) {
  /*不参与链式访问*/
  $$.extend($$, {
    // 创建dom元素
    create: function(type, value, html) {
      var dom = document.createElement(type);
      return $$().add(dom).attr(value).html(html);
    },
    // 移动DOM元素
    directChildren: function(dom, tag) {
      var result = [],
        children,
        tag = tag;
      if (typeof dom == 'string') {
        dom = F.prototype.init(dom);
      }
      if (dom.length) {
        for (var i = 0, len = dom.length; i < len; i++) {
          getDom(dom[i].children);
        }
      } else {
        getDom(dom.children);
      }

      function getDom(doms) {
        for (var c = 0, clen = doms.length; c < clen; c++) {
          if (doms[c].tagName.toLowerCase() == tag.toLowerCase()) {
            result.push(doms[c]);
          }
        }
      }
      return $$(result);
    },

    //id选择器
    $id: function(id) {
      return document.getElementById(id);
    },
    //tag选择器
    $tag: function(tag, context) {
      if (typeof context == 'string') {
        context = $$.$id(context);
      }
      if (context) {
        return context.getElementsByTagName(tag);
      } else {
        return document.getElementsByTagName(tag);
      }
    },
    // class选择器
    $class: function(className, context) {
      var i = 0,
        len, dom = [],
        arr = [];
      // 如果传递过来的是字符串 ，则转化成元素对象
      if (context && $$.isString(context)) {
        context = document.getElementById(context);
      } else {
        context = document;
      }
      // 如果兼容getElementsByClassName
      if (context.getElementsByClassName) {
        return context.getElementsByClassName(className);
      } else {
        //如果浏览器不支持
        dom = context.getElementsByTagName('*');

        for (i; len = dom.length, i < len; i++) {
          if (dom[i].className) {
            arr.push(dom[i]);
          }
        }
      }
      return arr;
    },
    // 分组选择器
    $group: function(content) {
      var result = [],
        doms = [];
      var arr = $$.trim(content).split(',');
      //alert(arr.length);
      for (var i = 0, len = arr.length; i < len; i++) {
        var item = $$.trim(arr[i])
        var first = item.charAt(0)
        var index = item.indexOf(first)
        if (first === '.') {
          doms = $$.$class(item.slice(index + 1))
            //每次循环将doms保存在reult中
            //result.push(doms);//错误来源

          //陷阱1解决 封装重复的代码成函数
          pushArray(doms, result)

        } else if (first === '#') {
          doms = [$$.$id(item.slice(index + 1))] //陷阱：之前我们定义的doms是数组，但是$id获取的不是数组，而是单个元素
            //封装重复的代码成函数
          pushArray(doms, result)
        } else {
          doms = $$.$tag(item)
          pushArray(doms, result)
        }
      }
      return result;

      //封装重复的代码
      function pushArray(doms, result) {
        for (var j = 0, domlen = doms.length; j < domlen; j++) {
          result.push(doms[j])
        }
      }
    },
    //层次选择器
    $cengci: function(select) {
      //个个击破法则 -- 寻找击破点
      var sel = $$.trim(select).split(' ');
      var result = [];
      var context = [];
      for (var i = 0, len = sel.length; i < len; i++) {
        result = [];
        var item = $$.trim(sel[i]);
        var first = sel[i].charAt(0)
        var index = item.indexOf(first)
        if (first === '#') {
          //如果是#，找到该元素，
          pushArray([$$.$id(item.slice(index + 1))]);
          context = result;
        } else if (first === '.') {
          //如果是.
          //如果是.
          //找到context中所有的class为【s-1】的元素 --context是个集合
          if (context.length) {
            for (var j = 0, contextLen = context.length; j < contextLen; j++) {
              pushArray($$.$class(item.slice(index + 1), context[j]));
            }
          } else {
            pushArray($$.$class(item.slice(index + 1)));
          }
          context = result;
        } else {
          //如果是标签
          //遍历父亲，找到父亲中的元素==父亲都存在context中
          if (context.length) {
            for (var j = 0, contextLen = context.length; j < contextLen; j++) {
              pushArray($$.$tag(item, context[j]));
            }
          } else {
            pushArray($$.$tag(item));
          }
          context = result;
        }
      }

      return context;

      //封装重复的代码
      function pushArray(doms) {
        for (var j = 0, domlen = doms.length; j < domlen; j++) {
          result.push(doms[j])
        }
      }
    },
    //多组+层次
    $select: function(str) {
      var result = [];
      var item = $$.trim(str).split(',');
      for (var i = 0, glen = item.length; i < glen; i++) {
        var select = $$.trim(item[i]);
        var context = [];
        context = $$.$cengci(select);
        pushArray(context);

      };
      return result;

      //封装重复的代码
      function pushArray(doms) {
        for (var j = 0, domlen = doms.length; j < domlen; j++) {
          result.push(doms[j])
        }
      }
    },
  });
  /*参与链式访问*/
  /*参与链式访问*/
  $$.extend({
    add: function(dom) {
      this[this.length] = dom;
      this.length++;
      return this;
    },
    append: function(child) {
      var doms = $$(child);
      for (var j = this.length - 1; j >= 0; j--) {
        for (var i = 0, len = doms.length; i < len; i++) {
          this[j].appendChild(doms[i]);
        }
      }
      return this;
    },
    appendTo: function(parent) {
      var doms = $$(parent);
      for (var i = 0; i < doms.length; i++) {
        for (var j = this.length - 1; j >= 0; j--) {
          doms[i].appendChild(this[j]);
        }
      }
      return this;
    },
    /*获取dom元素对象*/
    get: function(num) {
      return this[num] ? this[num] : null;
    },
    /*返回单个对象 - 类数组*/
    eq: function(num) {
      console.log('ffffff')
      return $$(this.get(num));
    },
    /*first*/
    first: function() {
      return this.eq(0);
    },
    /*last*/
    last: function() {
      return this.eq(this.length - 1);
    },

    find: function(str) {
      var result = [];
      for (var i = 0; i < this.length; i++) {
        switch (str.charAt(0)) {
          case '.':
            //class
            var doms = $$.$class(str.substring(1), this[i]);
            pushArray(doms);
            break;
          default:
            //标签
            var doms = $$.$tag(str, this[i]);
            pushArray(doms);
        }
      }

      var that = this;
      this.length = result.length;
      //这里遍历应从第1个开始到倒数第二个，而不是最后一个，因为最后一个属性是length
      for (var i = 0; i < this.length; i += 1) {
        that[i] = result[i];
      }
      return this;

      //封装重复的代码
      function pushArray(doms) {
        for (var j = 0, domlen = doms.length; j < domlen; j++) {
          result.push(doms[j])
        }
      }
    },
    /*获取子孙*/
    children: function() {
      var that = this;
      var children = getChildren(this[0]); //children是子元素的dom
      that.length = children.length;


      //先删除father的所有dom
      for (var i = 0; i < that.length; i += 1) {
        delete that[i];
      }

      //这里遍历应从第1个开始到倒数第二个，而不是最后一个，因为最后一个属性是length
      for (var i = 0; i < children.length; i++) {
        that[i] = children[i];
      }
      return that;

      function getChildren(obj) {
        return obj.children;
      }
    },
    /*获取父亲*/
    parent: function() {
      var parent = getParent(this[0]);

      //先删除son的所有dom
      for (var i = 0; i < this.length; i++) {
        delete this[i];
      }

      this[0] = parent;
      this.length = 1;

      function getParent(obj) {
        return obj.parentNode;
      }

      return this;
    },
    /*获取索引值*/
    index: function() {
      return getIndex(this[0]);

      function getIndex(obj) {
        var children = obj.parentNode.children;
        for (var i = 0; i < children.length; i++) {
          if (children[i] == obj) {
            return i;
          }
        }
      }
    },
    siblings: function() {
      var that = this;
      var siblings = getSiblings(this[0]); //children是子元素的dom
      console.log('获取兄弟' + siblings)
      that.length = siblings.length;

      //先删除原先伪数组中的所有dom
      for (var i = 0; i < that.length; i += 1) {
        delete that[i];
      }
      //这里遍历应从第1个开始到倒数第二个，而不是最后一个，因为最后一个属性是length
      for (var i = 0; i < siblings.length; i++) {
        that[i] = siblings[i];
      }
      return that;

      function getSiblings(o) {
        //参数o就是想取谁的兄弟节点，就把那个元素传进去
        var a = []; //定义一个数组，用来存o的兄弟元素
        var p = o.previousSibling;
        while (p) { //先取o的哥哥们 判断有没有上一个哥哥元素，如果有则往下执行  p表示previousSibling
          if (p.nodeType === 1) {
            a.push(p);
          }
          p = p.previousSibling //最后把上一个节点赋给p
        }
        a.reverse() //把顺序反转一下 这样元素的顺序就是按先后的了
        var n = o.nextSibling; //再取o的弟弟
        while (n) { //判断有没有下一个弟弟结点 n是nextSibling的意思
          if (n.nodeType === 1) {
            a.push(n);
          }
          n = n.nextSibling;
        }
        return a //最后按从老大到老小的顺序，把这一组元素返回
      }
    },
  });
})($$);

/*缓存模块*/
(function($$) {
  //缓存框架 - 内存篇
  $$.cache = {
    data: [],
    get: function(key) {
      console.log('111')
      var value = null;
      console.log(this.data)
      for (var i = 0, len = this.data.length; i < len; i++) {
        var item = this.data[i]
        if (key == item.key) {
          value = item.value;
        }
      }
      console.log('get' + value)
      return value;
    },
    add: function(key, value) {
      var json = { key: key, value: value };
      this.data.push(json);
    },
    delete: function(key) {
      var status = false;
      for (var i = 0, len = this.data.length; i < len; i++) {
        var item = this.data[i]
          // 循环数组元素
        if (item.key.trim() == key) {
          this.data.splice(i, 1); //开始位置,删除个数
          status = true;
          break;
        }
      }
      return status;
    },
    update: function(key, value) {
      var status = false;
      // 循环数组元素
      for (var i = 0, len = this.data.length; i < len; i++) {
        var item = this.data[i]
        if (item.key.trim() === key.trim()) {
          item.value = value.trim();
          status = true;
          break;
        }
      }
      return status;
    },
    isExist: function(key) {
      for (var i = 0, len = this.data.length; i < len; i++) {
        var item = this.data[i]
        if (key === item.key) {
          return true;
        } else {
          return false;
        }
      }
    }
  }

  //cookie框架
  $$.cookie = {
    //设置coolie
    setCookie: function(name, value, days, path) {
      var name = escape(name);
      var value = escape(value);
      var expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
      path = path == "" ? "" : ";path=" + path;
      _expires = (typeof hours) == "string" ? "" : ";expires=" + expires.toUTCString();
      document.cookie = name + "=" + value + _expires + path;
    },
    //获取cookie值
    getCookie: function(name) {
      var name = escape(name);
      //读cookie属性，这将返回文档的所有cookie
      var allcookies = document.cookie;

      //查找名为name的cookie的开始位置
      name += "=";
      var pos = allcookies.indexOf(name);
      //如果找到了具有该名字的cookie，那么提取并使用它的值
      if (pos != -1) { //如果pos值为-1则说明搜索"version="失败
        var start = pos + name.length; //cookie值开始的位置
        var end = allcookies.indexOf(";", start); //从cookie值开始的位置起搜索第一个";"的位置,即cookie值结尾的位置
        if (end == -1) end = allcookies.length; //如果end值为-1说明cookie列表里只有一个cookie
        var value = allcookies.substring(start, end); //提取cookie的值
        return unescape(value); //对它解码
      } else return ""; //搜索失败，返回空字符串
    },
    //删除cookie
    deleteCookie: function(name, path) {
      var name = escape(name);
      var expires = new Date(0);
      path = path == "" ? "" : ";path=" + path;
      document.cookie = name + "=" + ";expires=" + expires.toUTCString() + path;
    }
  }

  //本地存储框架
  $$.store = (function() {
    var api = {},
      win = window,
      doc = win.document,
      localStorageName = 'localStorage',
      globalStorageName = 'globalStorage',
      storage;

    api.set = function(key, value) {};
    api.get = function(key) {};
    api.remove = function(key) {};
    api.clear = function() {};

    if (localStorageName in win && win[localStorageName]) {
      storage = win[localStorageName];
      api.set = function(key, val) { storage.setItem(key, val) };
      api.get = function(key) {
        return storage.getItem(key)
      };
      api.remove = function(key) { storage.removeItem(key) };
      api.clear = function() { storage.clear() };

    } else if (globalStorageName in win && win[globalStorageName]) {
      storage = win[globalStorageName][win.location.hostname];
      api.set = function(key, val) { storage[key] = val };
      api.get = function(key) {
        return storage[key] && storage[key].value
      };
      api.remove = function(key) { delete storage[key] };
      api.clear = function() {
        for (var key in storage) { delete storage[key] }
      };

    } else if (doc.documentElement.addBehavior) {
      function getStorage() {
        if (storage) {
          return storage
        }
        storage = doc.body.appendChild(doc.createElement('div'));
        storage.style.display = 'none';
        // See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
        // and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
        storage.addBehavior('#default#userData');
        storage.load(localStorageName);
        return storage;
      }
      api.set = function(key, val) {
        var storage = getStorage();
        storage.setAttribute(key, val);
        storage.save(localStorageName);
      };
      api.get = function(key) {
        var storage = getStorage();
        return storage.getAttribute(key);
      };
      api.remove = function(key) {
        var storage = getStorage();
        storage.removeAttribute(key);
        storage.save(localStorageName);
      }
      api.clear = function() {
        var storage = getStorage();
        var attributes = storage.XMLDocument.documentElement.attributes;;
        storage.load(localStorageName);
        for (var i = 0, attr; attr = attributes[i]; i++) {
          storage.removeAttribute(attr.name);
        }
        storage.save(localStorageName);
      }
    }
    return api;
  })();
})($$);
