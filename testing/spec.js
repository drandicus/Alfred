describe('Protractor Demo Test', function(){
 it("should have a title", function(){
  browser.get('http://juliemr.github.io/protractor-demo/');
  console.log("Here");
  expect(browser.getTitle()).toEqual('Super Calculator');
  expect(true).toEqual(false);
 })
});
