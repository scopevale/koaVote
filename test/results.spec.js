var testHelpers = require('./testHelpers.js');
var utils = require('../routes/utils.js');
var co = require('co');
var should = require('should');
var request = testHelpers.request;

describe('Showing results', function(){
	var resultPostData = {};

	beforeEach(function (done) {
		resultPostData = {
			questionId : '',
			tagString : '',
			from : '',
			to : ''
		};
		testHelpers.removeAllDocs(done);
	});

	afterEach(function (done) {
		testHelpers.removeAllDocs(done);
	});

	it('has a page to request results from', function(done){
		co(function *(){
			var q = yield testHelpers.questions.insert({
				tags : ['RS Bungsu','tag 1', 'tag 2', 'tag 3'],
				questionTitle : 'Question Q1?'
			});

			var q2 = yield testHelpers.questions.insert({
				tags : ['RS Bungsu', 'tag 1', 'tag 2', 'tag 3'],
				questionTitle : 'Question Q2?'
			});

			request
				.get('/results')
				.auth(testHelpers.testUser.name, testHelpers.testUser.pass)
		  		.expect(function (req) {
		  			req.text.should.containEql('Question Q1?');
		  			req.text.should.containEql('Question Q2?');
		  		})
				.end(done);
		})();
	});

	it("sets content type for excel", function (done) {
		request
			.post('/results')
			.auth(testHelpers.testUser.name, testHelpers.testUser.pass)
			.send(resultPostData)
	  		.expect("content-type", "application/vnd.ms-excel")
			.end(done);
	});

	it("sets the filename to default value when no question is selected", function (done) {
		request
			.post('/results')
			.auth(testHelpers.testUser.name, testHelpers.testUser.pass)
			.send(resultPostData)
		  	.expect("content-disposition", "attachment;filename=results.xls")
			.end(done);
	});

	it("sets the file name to the selected question title", function (done) {
		co(function *(){
			var q = yield testHelpers.questions.insert({
				tags : ['RS Bungsu','tag 1', 'tag 2', 'tag 3'],
				questionTitle : 'Question Q1'
			});

			resultPostData.questionId = q._id;

			request
				.post('/results')
				.auth(testHelpers.testUser.name, testHelpers.testUser.pass)
				.send(resultPostData)
		  		.expect("content-disposition", "attachment;filename=Question Q1.xls")
				.end(done);
		})();
	});

	it('filters the results by questionid', function (done) {
		co(function *(){
			yield [
				testHelpers.votes.insert({ voteValue : 1, questionId : 111}),
				testHelpers.votes.insert({ voteValue : 2, questionId : 111}),
				testHelpers.votes.insert({ voteValue : 3, questionId : 111}),
				testHelpers.votes.insert({ voteValue : 4, questionId : 222})
			];

			resultPostData.questionId = 111;

			request
				.post('/results')
				.auth(testHelpers.testUser.name, testHelpers.testUser.pass)
				.send(resultPostData)
				.expect(200)
		  		.expect(function (res) {
		  			res.text.should.containEql('<td>1</td>');
		  			res.text.should.containEql('<td>2</td>');
		  			res.text.should.containEql('<td>3</td>');
		  		})
				.end(done);
		})();
	});
	it('filters the results on one tag', function (done) {
		co(function *(){
			yield [
				testHelpers.votes.insert({ voteValue : 1, tags : ['tag 1', 'tag 2'], questionId : 111}),
				testHelpers.votes.insert({ voteValue : 2, tags : ['tag 2'], questionId : 111}),
				testHelpers.votes.insert({ voteValue : 3, tags : ['tag 2', 'tag 1'], questionId : 111}),
				testHelpers.votes.insert({ voteValue : 4, tags : ['tag 3', 'tag 4'], questionId : 111})
			];

			resultPostData.tagString = 'tag 2';

			request
				.post('/results')
				.auth(testHelpers.testUser.name, testHelpers.testUser.pass)
				.send(resultPostData)
				.expect(200)
		  		.expect(function (res) {
		  			res.text.should.containEql('<td>1</td>');
		  			res.text.should.containEql('<td>2</td>');
		  			res.text.should.containEql('<td>3</td>');
		  		})
				.end(done);
		})();
	});
	it('filters the results on several tags', function (done) {
		co(function *(){
			yield [
				testHelpers.votes.insert({ voteValue : 1, tags : ['tag 1'], questionId : 111}),
				testHelpers.votes.insert({ voteValue : 2, tags : ['tag 2'], questionId : 111}),
				testHelpers.votes.insert({ voteValue : 3, tags : ['tag 2', 'tag 1'], questionId : 111}),
				testHelpers.votes.insert({ voteValue : 4, tags : ['tag 3', 'tag 4'], questionId : 111})
			];

			resultPostData.tagString = 'tag 1, tag 2';

			request
				.post('/results')
				.auth(testHelpers.testUser.name, testHelpers.testUser.pass)
				.send(resultPostData)
				.expect(200)
		  		.expect(function (res) {
		  			res.text.should.containEql('<td>1</td>');
		  			res.text.should.containEql('<td>2</td>');
		  			res.text.should.containEql('<td>3</td>');
		  		})
				.end(done);
		})();
	});
	it('filters the results on to and from dates', function (done) {
		co(function *(){
			var t1 = utils.yyyymmdd_to_date('2014-01-01');
			var t2 = utils.yyyymmdd_to_date('2014-01-15');
			var t3 = utils.yyyymmdd_to_date('2014-01-31');
			var t4 = utils.yyyymmdd_to_date('2014-02-01');

			yield [
				testHelpers.votes.insert({ voteValue : 1, created_at : t1, questionId : 111}),
				testHelpers.votes.insert({ voteValue : 2, created_at : t2, questionId : 111}),
				testHelpers.votes.insert({ voteValue : 3, created_at : t3, questionId : 111}),
				testHelpers.votes.insert({ voteValue : 4, created_at : t4, questionId : 111})
			];

			resultPostData.from = '2014-01-15';
			resultPostData.to = '2014-01-31';

			request
				.post('/results')
				.auth(testHelpers.testUser.name, testHelpers.testUser.pass)
				.send(resultPostData)
				.expect(200)
		  		.expect(function (res) {
		  			res.text.should.containEql('<td>2</td>');
		  			res.text.should.containEql('<td>3</td>');
		  		})
				.end(done);
		})();
	});
});