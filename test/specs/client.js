define(['chai-as-promised', 'lib/client', 'lib/resource'], function(chaiAsPromised, Client, Resource) {
  chai.use(chaiAsPromised);

  describe.only('Client', function() {
    it('can be instantiated', function() {
      expect(new Client("")).to.be.an.instanceOf(Client);
    });

    describe('#constructor', function() {
      describe('when not given an api root', function() {
        it('throws an error', function() {
          expect(function() {
            new Client();
          }).to.throw(/Client must be initialized with an API Root/);
        });
      });
    });

    describe('#walk', function() {
      var server;

      beforeEach(function() {
        server = sinon.fakeServer.create();
        server.autoRespond = true;
      });

      afterEach(function() {
        server.restore();
        server = null;
      });

      describe('when given an api root', function() {
        var client = new Client('/v1/foo');

        describe('that does not conform to the hypermedia format', function() {
          var response = [
            200,
            { "Content-Type": "application/json" },
            JSON.stringify({})
          ];

          it('returns a rejected promise', function() {
            server.respondWith('OPTION', '/v1/foo', response);
            return expect(client.walk()).to.be.rejectedWith(/API does not conform to expected hypermedia format/);
          });
        });

        describe('that does conform to the hypermedia format', function() {
          var links = {
            _links: {
              self: {
                href: '/v1/foo'
              }
            }
          };
          var response = [
            200,
            { "Content-Type": "application/json" },
            JSON.stringify(links)
          ];

          it('returns a resolved promise ', function() {
            server.respondWith('OPTION', '/v1/foo', response);
            return expect(client.walk()).to.eventually.be.an.instanceOf(Resource);
          });
        });
      });
    });
  });
});
