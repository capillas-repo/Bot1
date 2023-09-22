describe('myModule', function() {
    describe('#myFunction()', function() {
      it('should return true when passed true', function() {
        assert.equal(myModule.myFunction(true), true);
      });
      it('should return false when passed false', function() {
        assert.equal(myModule.myFunction(false), false);
      });
    });
  });