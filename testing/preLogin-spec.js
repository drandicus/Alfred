describe('Pre Login Page Test', function(){

	browser.get("http://localhost:3000/")
	browser.waitForAngular()

	it("should have a title", function(){
		console.log(browser.getTitle());
		expect(browser.getTitle()).toEqual("Alfred")
	})

	it("should have a login and sign up area", function(){
		var login = element(by.id('login'));
		var signup = element(by.id('signup'));

		expect(login.getText()).toContain("Login");
		expect(signup.getText()).toContain("Sign Up");
	})

	it("should handle logging in properly", function(){
		var email = element(by.model('loginEmail'));
		var password = element(by.model('loginPassword'));
		var login = element(by.id('login'));

		login.click();

		var submit = element(by.id("loginSubmit"));

		email.sendKeys("deverasd@gmail.com");
		password.sendKeys("Mochamocha1");

		var firstURL = browser.getCurrentUrl();
		console.log(firstURL);

		submit.click().then(function(){
			expect(firstURL).not.toEqual(browser.getCurrentUrl());
		})

	})
});