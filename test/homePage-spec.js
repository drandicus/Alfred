describe("Home Page Testing", function(){

	browser.get("http://localhost:3000/")
	browser.waitForAngular()

	/* Logging into the home page */
	var email = element(by.model('loginEmail'));
	var password = element(by.model('loginPassword'));
	var login = element(by.id('login'));

	login.click();

	var submit = element(by.id("loginSubmit"));

	email.sendKeys("deverasd@gmail.com");
	password.sendKeys("Mochamocha1");

	var firstURL = browser.getCurrentUrl();

	submit.click()
	browser.waitForAngular()

	/*
		First Check, checks to see if the front and back of the flip have the same styling
	*/
	it("should check to see if the front and back have the same styling", function(){
		var map = element(by.id('map'));
		var back = element(by.id('list'));
		expect(back.getAttribute('style')).not.toBe(map.getAttribute('style'))
	})

	/*
		Then checks to see if you can flip and if it does, if you can change the styling
	*/
	it("should see if you can flip after inputting a search item", function(){
		var searchBar = element(by.id('searchItem'));
		var searchButton = element(by.id('search'));

		var oldStyling = element(by.id('map')).getAttribute('style');
		searchBar.sendKeys('mexican restaurants in Champaign');

		element(by.id('flip')).click()
		searchButton.click().then(function(){
			element(by.id('flip')).click().then(function(){
				expect(oldStyling).not.toBe(element(by.id('list')).getAttribute('style'));
			})
		})
	})

	/*
		Finally checks to see if you can populate the back list
	*/
	it('should populate the back list', function(){
		var back = element(by.id('list'));
		expect(back.element(by.binding('childBinding'))).not.toBe(null);
	})

	/*
		Checks to see if the sidebar works part 1
		this checks to see if the button is clicked and events occur
	*/
	it('should properly change the sidebar by changing the color', function(){
		var sidebarButton = element(by.css('.header-sidebar'));
		var oldStyling = sidebarButton.getAttribute("style");
		sidebarButton.click().then(function(){
			expect(oldStyling).not.toBe(sidebarButton.getAttribute("style"));
		})
	})
})