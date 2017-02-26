(function (win) {
	var _strategies = win.strategies,
		_Validator = win.Validator;
	
	var strategies = {
		isNonEmpty: function (value, errorMsg) {
			if (value === ''){
				return errorMsg;
			}
		},
		isNonEqual: function (value, val, errorMsg) {
			if (value !== val){
				return errorMsg;
			}
		},
		isNonEmail: function (value, errorMsg) {
			//最正宗/^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/
			if (!/^[a-z0-9]+([._\\-]*[a-z0-9])*@(163.com|126.com|sohu.com|gmail.com|qq.com|sina.com|ifeng.com)$/.test(value)){
				return errorMsg;
			}
		},
		maxLength: function (value, length, errorMsg) {
			if (value.length > length) {
				return errorMsg;
			}
		},
		minLength: function (value, length, errorMsg) {
			if (value.length < length) {
				return errorMsg;
			}
		},
		checkVerify: function (value, errorMsg) {
			if (!/^[0-9a-zA-Z]{4}$/.test(value)) {
				return errorMsg;
			}
		},
		isPhone: function (str, errorMsg) {
			if (!/^1\d{10}$/.test(str)) {
				return errorMsg;
			}
		}
	};
	
	
	var Validator = function (){
		this.cache = [];
	}
	Validator.prototype.add = function (dom, rules){
		var _self = this;
		
		for (var i = 0, rule; rule = rules[i++];){
			(function (rule){
				var strategyAry = rule.strategy.split(':'),
					errorMsg = rule.errorMsg;
				
				_self.cache.push(function (){
					var strategy = strategyAry.shift();
					
					strategyAry.unshift(dom.val());
					strategyAry.push(errorMsg);
					return strategies[strategy].apply(dom, strategyAry);
				})
			})(rule);
		}
	}
	Validator.prototype.returnOneError = function (){
		var _ret;
		
		for (var i = 0, validatorFunc; validatorFunc = this.cache[i++];){
			_ret = validatorFunc();
			
			if (!(_ret == null)) {
				return _ret;
			};
		};
	}
	Validator.prototype.returnAllError = function (){
		var _ret,
			_retArr = [];
		
		for (var i = 0, validatorFunc; validatorFunc = this.cache[i++];){
			_ret = validatorFunc();
			
			if (!(_ret == null)) {
				_retArr.push(_ret);
			}
		};
		if (_retArr.length > 0) {
			return _retArr;
		}
	}
	
	win.Validator = Validator;
	win.strategies = strategies;
})(window);


