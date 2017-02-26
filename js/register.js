(function(win, $, Validator, strategies) {
	var _useregister = win.useregister;
	//验证码图片
	var authcode = (function() {
		var _authcodeImgURL = ['img/authcode0.jpg', 'img/authcode1.jpg', 'img/authcode2.jpg', 'img/authcode3.jpg', 'img/authcode4.jpg', 'img/authcode5.jpg'],
			_index = 0,
			_len = _authcodeImgURL.length - 1;
		
		function check() {
			if (_index === _len) {
				_index = 0;
			}else {
				_index++;
			}
		}
		return {
			get: function() {
				check();
				return _authcodeImgURL[_index];
			}
		}
	})();
	
	var register = {		
		emailInputHasFocus: false,                        //保存邮箱输入框是否获得过焦点		
		emailOldValue: null,                              //保存上一次邮箱输入框输入的值				
		emailTipsFocusIndex: 0,                           //下拉邮箱提示焦点所在位置的初始化
		keyCommands: {                                    //按键值与keyMapMethods的属性的映射
			'38': 'up',
			'40': 'down',
			'13': 'enter'
		},
		keyMapMethods: {
			up: function(context, cName) {
				var _this = register;
				
				if(_this.emailTipsFocusIndex === 0) {
					_this.emailTipsFocusIndex = context.length-1;
				}else {
					_this.emailTipsFocusIndex--;
				};
				context.removeClass(cName);
				context.eq(_this.emailTipsFocusIndex).addClass(cName);
			},
			down: function(context, cName) {
				var _this = register;
				
				if(_this.emailTipsFocusIndex == context.length - 1) {
					_this.emailTipsFocusIndex = 0;
				}else {
					_this.emailTipsFocusIndex++;
				};
				context.removeClass(cName);
				context.eq(_this.emailTipsFocusIndex).addClass(cName);
			},
			enter: function(context) {
				var _this = register;
				
				return context.eq(_this.emailTipsFocusIndex).text();
			}
		},
		makeCommand: function(receiver, state, context, cName) {//安装命令
			return function() {
				var _ret;
				
				try{
					_ret = receiver[state](context, cName);
					if (_ret) {
						return receiver[state](context, cName);
					}
				}catch(e){
					
				}
			}
		},
		strengthHtml: {                                          //保存密码强度html代码  
			strong: '密码强度：<span class="safe_green">高</span><br><img src="img/b01.gif" width="44" height="4"/><img src="img/b02.gif" width="44" height="4" class="m105"/><img src="img/b03.gif" width="44" height="4" class="m105"/>',
			medium: '密码强度：<span class="safe_orange">中</span><br><img src="img/b01.gif" width="44" height="4"/><img src="img/b02.gif" width="44" height="4" class="m105"/>',
			week: '密码强度：<span class="safe_red">低</span><br><img src="img/b01.gif" width="44" height="4"/>'
		},
		init: function() {
			var _this = register;
			$('body').on('click', _this.checkEmail);
			
			_this.bindTabClick();
			//邮箱注册
			$('#js-email').on('focus', _this.fillEmailInfo)
						  .on('keyup', _this.fillEmailInfo);
						  
			$('#js-email-password').on('focus', _this.pwdFocusP)
								   .on('blur', _this.pwdFlurP);
			
			$('#js_email-password-confirm').on('focus', _this.pwdConfirmFocusP)
										   .on('blur', _this.pwdConfirmBlurP);
			
			$('#js-email-reg-code').on('focus', _this.regCodeFocusP)
								   .on('blur', _this.regCodeBlurP);
			
			$('#js-email-check').on('click', _this.emailCheckP);
			
			$('#js-email-reg-code-refresh').on('click', _this.regcodeRefreshP);
			
			$('#js-email-reg-submit').on('click', _this.emailSubmit);
			
//			$('#js-email-reg-code').on('focus', _this.emailRegFocusP)
//								   .on('blur', _this.emailRegBlurP);
			
			
			
			//手机注册
			$('#js-mobile-pic-reg-code').on('focus', _this.mobileRegCodeFocusP)
									    .on('blur', _this.mobileRegCodeBlurP);
			
			$('#js-mobile-number').on('focus', _this.phoneNumberFocusP)
								  .on('blur', _this.phoneNumberBlurP);
			
			$('#js-mobile-pic-code-refresh').on('click', _this.mobilePicRefreshP);
			
			$('#js-mobile-password').on('focus', _this.mobilePwdFocusP)
									.on('blur', _this.mobilePwdBlurP);
			
			$('#js-mobile-password-confirm').on('focus', _this.mobilePwdConFocusP)
											.on('blur', _this.mobilePwdConBlurP);
			
			$('#js-mobile-check').on('click', _this.mobileCheckClickP);
			
			$('#js-mobile-reg-submit').on('click', _this.mobileSubmit);
			
		},
		emailValidator: function() {
			var _validator = new Validator(),
				_ret;
			
			_validator.add($('#js-email'), [{
				strategy: 'isNonEmpty',
				errorMsg: '请输入邮箱'
			}, {
				strategy: 'isNonEmail',
				errorMsg: '邮箱格式不正确'
			}]);
			
			_ret = _validator.returnOneError();
			return _ret;
		},
		checkEmail: function(e) {
			var $target = $(e.target),
				_errorMsg,
				_this = register;
			
			if($target.hasClass('js_emailTip')) {
				$('#js-email').val($target.text());
			};
			if(!$('#js-email').is(':focus') && _this.emailInputHasFocus) {  //如果焦点不在邮箱输入框中，就检查邮箱输入的内容
				_errorMsg = _this.emailValidator();
		
				if(_errorMsg) {
					$('#js-email-tips, #js-email-ok').hide();
					$('#js-email-error').text(_errorMsg).show();
				}else {
					$('#js-email-tips').hide();
					$('#js-email-ok').show();
				};
				$('#js-email-list').hide();
			}
		},
		fillEmailInfo: function (e) {
			var _this = register,
				_keyCode = e.which,
				_command,
				_ret,
				_self = this,
				_sHtml = '',
				_emailOfHead,
				_emailOfTail,
				_getEmailTail,
				_aEmailTail = ['163.com', '126.com', 'sohu.com', 'gmail.com', 'qq.com', 'sina.com', 'ifeng.com'],
				_val = $(_self).val(),
				_atIndex = _val.indexOf('@');
			
			if(e.type === 'focus') {
				_this.emailOldValue = null;
				_this.emailInputHasFocus = true;
				$('#js-email-error, #js-email-ok').hide();
				$('#js-email-tips').show();
			};
			
			if(_atIndex !== -1 && _this.emailOldValue !== _val) {
				//获取邮箱@前面和后面的两个字符串
				_emailOfHead = _val.substring(0, _atIndex + 1);
				_emailOfTail = _val.substring(_atIndex + 1, _val.length);
				
				_getEmailTail = findEmailTail(_aEmailTail, _emailOfTail);
				if(checkEmailHead(_emailOfHead) && _getEmailTail.length > 0 && !checkIsEqualEmailTail(_aEmailTail, _emailOfTail)) {
					for(var i = 0, emailT; emailT = _getEmailTail[i++];) {
						_sHtml += ('<li class="js_emailTip">' + (_emailOfHead + emailT) + '</li>');
					};
					$('.js_emailTip').remove();
					$(_sHtml).appendTo($('#js-email-list'));
					
					$('.js_emailTip').eq(0).addClass('hover');
					if (!$('#js-email-list').is(':visible')) {
						$('#js-email-list').show();
					};
					_this.emailTipsFocusIndex = 0;
					
					setEmailTipClick();
				}else if(_keyCode === 86 && checkIsEqualEmailTail(_aEmailTail, _emailOfTail)){ //复制的情况
				}else {
					$('#js-email-list').hide();
				}
			}else if(_atIndex === -1) {
				$('.js_emailTip').remove();
				$('#js-email-list').hide();
			}
			_this.emailOldValue = _val;
			
			if($('.js_emailTip').is(':visible')) {
				_command = _this.makeCommand(_this.keyMapMethods, _this.keyCommands[_keyCode], $('.js_emailTip'), 'hover');
				
				if(_command) {
					_ret = _command();
					if(_ret) {
						$(_self).val(_ret);
						$('#js-email-list').hide();
						$('#js-email-tips').show();
					}
				}
			}
			
			function findEmailTail(aEmailTail, str) {
				if (str === '') {
					return aEmailTail;
				}
				
				return $.grep(aEmailTail, function (elem, index) {
					return elem.indexOf(str) === 0;
				})
			}
			function checkEmailHead(str) {
				return /^[a-z0-9]+([._\\-]*[a-z0-9])*@$/.test(str);
			}
			function checkIsEqualEmailTail(aEmailTail, str) {
				return $.grep(aEmailTail, function (elem, index){
					return str === elem;
				}).length === 1 ? true : false;
			}
			
			//邮箱提示添加点击事件
			function setEmailTipClick() {
				$('.js_emailTip').on('click', function () {
					var _val = $(this).text();
				
					$('#js-email').val(_val);
					$('.js_emailTip').hide();
					$('#js-email-list').hide();
					$('#js-email-tips').show();
				})
			}
		},
		checkPassword: function($elem) {
			var _validator = new Validator(),
				_ret;
			
			_validator.add($elem, [{
				strategy: 'isNonEmpty',
				errorMsg: '请输入密码'
			}, {
				strategy: 'minLength:6',
				errorMsg: '密码格式不正确'
			}, {
				strategy: 'maxLength:20',
				errorMsg: '密码格式不正确'
			}]);
			
			_ret = _validator.returnOneError();
			return _ret;
		},
		checkPwdStrength: function(pwdValue, fn) {
			var _modes = 0,
				_this = register,
				_aStrength = ['week', 'medium', 'strong'];
			
			if(/\d/.test(pwdValue)) _modes++;
			if(/[a-z]/.test(pwdValue)) _modes++;
			if(/[A-Z]/.test(pwdValue)) _modes++;
			if(/[\W]/.test(pwdValue)) _modes++;
			
			switch(_modes) {
				case 1 :
					fn(_this.strengthHtml[_aStrength[0]]);
					break;
				case 2 :
					fn(_this.strengthHtml[_aStrength[1]]);
					break;
				case 3:
				case 4:
					fn(_this.strengthHtml[_aStrength[2]]);
					break;
				default: 
					throw new TypeError('The modes in checkPwdStrength has error!');
			}
		},
		pwdFlurP: function() {
			var _self = this,
				_val = $(_self).val(),
				_errorMsg,
				_this = register;
			
			_errorMsg = _this.checkPassword($('#js-email-password'));
			if(_errorMsg) {
				$('#js-email-tips-2, #js-email-password-tips-2').hide();
				$('#js-email-password-error').text(_errorMsg).show();
				return;
			};
			
			_this.checkPwdStrength(_val, function(str){
				$('#js-email-tips-2').hide();
				$('#js-email-password-tips-2').empty().append(str).show();
			});
		},
		pwdFocusP: function() {
			$('#js-email-password-error, #js-email-password-tips-2').hide();
			$('#js-email-tips-2').show();
		},
		nextCheckPwd: function($prev, $curr) {
			var _validator = new Validator(),
				_ret,
				_val = $prev.val(),
				_str = 'isNonEqual:' + _val;
			
			_validator.add($curr, [{
				strategy: 'isNonEmpty',
				errorMsg: '请确认密码'
			}, {
				strategy: _str,
				errorMsg: '前后密码不一致'
			}]);
			
			_ret = _validator.returnOneError();
			return _ret;
		},
		pwdConfirmFocusP: function() {
			$('#js-email-confirm-tips-2, #js-email-confirm-tips-3').hide();
		},
		pwdConfirmBlurP: function() {
			var _this = register;
				_errorMsg = _this.nextCheckPwd($('#js-email-password'), $('#js_email-password-confirm'));
			
			if(_errorMsg) {
				$('#js-email-confirm-tips-2').text(_errorMsg).show();
			}else {
				$('#js-email-confirm-tips-3').show();
			}
		},
		checkVerifyCode: function($elem) {
			var _validator = new Validator(),
				_ret;
			
			_validator.add($elem, [{
				strategy: 'isNonEmpty',
				errorMsg: '请输入验证码'
			}, {
				strategy: 'checkVerify',
				errorMsg: '验证码格式不正确'
			}]);
			
			_ret = _validator.returnOneError();
			return _ret;
		},
		regCodeBlurP: function() {
			var _this = register;
				_errorMsg = _this.checkVerifyCode($('#js-email-reg-code'));
		
			if(_errorMsg) {
				$('#email-code-tips').text(_errorMsg).addClass('red'); 
			}
		},
		regCodeFocusP: function() {
			$('#email-code-tips').text('请输入验证码').removeClass('red');
		},
		emailCheckP: function() {
			$('#js-email-reg-submit').toggleClass('btn01_disable');
		},
		emailSubmit: throttle(function() {
			var _this = register;
			
			if($(this).hasClass('btn01_disable')) {
				return false;
			}else {
				console.log('提交表单');
			}
		}, 1000),
		bindTabClick: function() {
			$('#js-reg-tab-2').on('click', function() {
				$('#js-reg-tab-1').removeClass('current');
				$(this).addClass('current');
				$('#js-reg-tab-con-1').hide();
				$('#js-reg-tab-con-2').show();
			});
			
			$('#js-reg-tab-1').on('click', function() {
				$('#js-reg-tab-2').removeClass('current');
				$(this).addClass('current');
				$('#js-reg-tab-con-2').hide();
				$('#js-reg-tab-con-1').show();
			});
		},
		//验证码图片
		regcodeRefreshP: function() {
			$('#js-email-reg-code-pic')[0].src = authcode.get();
		},
		mobilePicRefreshP: function() {
			$('#js-mobile-reg-code-pic')[0].src = authcode.get();
		},
		mobileRegCodeFocusP: function() {
			$('#mobile-pic-code-tips').text('请输入验证码').removeClass('red');
		},
		mobileRegCodeBlurP: function() {
			var _this = register,
				_errorMsg = _this.checkVerifyCode($('#js-mobile-pic-reg-code'));
		
			if(_errorMsg) {
				$('#mobile-pic-code-tips').text(_errorMsg).addClass('red'); 
			}
		},
		checkPhoneNubmer: function() {
			var _validator = new Validator(),
				_ret;
			
			_validator.add($('#js-mobile-number'), [{
				strategy: 'isNonEmpty',
				errorMsg: '请输入手机号'
			}, {
				strategy: 'isPhone',
				errorMsg: '手机号格式不正确'
			}]);
			
			_ret = _validator.returnOneError();
			return _ret;
		},
		phoneNumberBlurP: function() {
			var _this = register,
			    _errorMsg= _this.checkPhoneNubmer();
		
			$('#js-mobile-tips').hide();
			if(_errorMsg) {
				$('#js-mobile-error').text(_errorMsg).show();
				return;
			}
			$('#js-mobile-ok').show();
		},
		phoneNumberFocusP: function() {
			$('#js-mobile-error, #js-mobile-ok').hide();
			$('#js-mobile-tips').show();
		},
		mobilePwdFocusP: function() {
			$('#js-mobile-password-error, #js-mobile-password-tips-2').hide();
			$('#js-mobile-password-tips-1').show();
		},
		mobilePwdBlurP: function() {
			var _this = register,
				_self = this,
				_val = $(_self).val(),
				_errorMsg;
			
			_errorMsg = _this.checkPassword($('#js-mobile-password'));
			$('#js-mobile-password-tips-1').hide();
			if(_errorMsg) {
				$('#js-mobile-password-error').text(_errorMsg).show();
				return;
			};
			_this.checkPwdStrength(_val, function(str) {
				$('#js-mobile-password-tips-1').hide();
				$('#js-mobile-password-tips-2').empty().append(str).show();
			});
		},
		mobilePwdConFocusP: function() {
			$('#js-mobile-confirm-tips-2, #js-mobile-confirm-tips-3').hide();
		},
		mobilePwdConBlurP: function() {
			var _this = register,
				_errorMsg = _this.nextCheckPwd($('#js-mobile-password'), $('#js-mobile-password-confirm'));
		
			if(_errorMsg) {
				$('#js-mobile-confirm-tips-2').text(_errorMsg).show();
			}else {
				$('#js-mobile-confirm-tips-3').show();
			}
		},
		mobileCheckClickP: function() {
			$('#js-mobile-reg-submit').toggleClass('btn01_disable');
		},
		mobileSubmit: throttle(function() {
				var _this = register;
			
				if($(this).hasClass('btn01_disable')) {
					return false;
				}else {
					console.log('提交表单');
				}
			}, 1000)
	}

	
	//节流函数
	function throttle(fn, interval) {
		var firstSign = true,
			timeId = null,
			_self = fn;
		
		return function() {
			var _me = this,
				args = arguments;
			
			if(firstSign) {
				_self.apply(_me, args);
				return firstSign = false;
			};
			
			if(timeId) {
				return false;
			};
			
			timeId = setTimeout(function () {
				clearTimeout(timeId);
				timeId = null;
				_self.apply(_me, args);
			}, interval || 500);
		}
	}
	
	
	win.useregister = register.init;
})(window, $, Validator, strategies);


