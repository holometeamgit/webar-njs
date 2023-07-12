(function (root, factory) {
	// console.log("function (root, factory)", root, factory)
	// console.log("global", global)
	// console.log("global.testCB", global.testCB)
	// console.log(factory())
	var exp = factory()
	var test_cv1 = {}
	test_cv1.num = 1
  	module.exports = {exp};
}(this, function () {

  var cv = (function() {
  return (
      function(cv) {
        cv = cv || {};

        cv.num = 10

        return cv
      }
    );
  })()

  console.log("=======")
  var test_cv2 = {}
  test_cv2.num = 2
  // module.exports = {test_cv};
  return test_cv2;
}));
