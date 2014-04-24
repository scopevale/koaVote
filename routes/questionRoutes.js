/**
 * Module dependencies.
 */
var parse = require('co-body');
var render = require('../lib/render');
var utils = require('./utils.js');
var questions = utils.questions;

/**
 * Show question adding page
 */
module.exports.showAddQuestion = function *add() {
	this.body = yield render('newQuestion');
};


/*
 ** shows the question data
*/
module.exports.showQuestion = function *(id) {
	var question = yield questions.findById(id);
	question.id = question._id.toString();
	this.body = yield render('question', { question : question });
};

/**
 * Add new question
 */
module.exports.addQuestion = function *() {
	var postedData = yield parse(this);
	var newQuestionURL = '/question/new';

	// Validate
	if(!utils.existsAndNonEmpty(postedData.hospital)){
		this.set('ErrorMessage', 'Hospital required');
		this.redirect(newQuestionURL);
		return;
	}
	if(!utils.existsAndNonEmpty(postedData.questionTitle)){
		this.set('ErrorMessage', 'Question required');
		this.redirect(newQuestionURL);
		return;
	}

	var question = createQuestionFromPostedData(postedData);
	var q = yield questions.insert(question);

	this.redirect('/question/' + q._id);
};

/**
 * Update question
 */
module.exports.updateQuestion = function *(id) {
	var questionUrl = '/question/' + id;
	var postedData = yield parse(this);

	// Validate
	if(!utils.existsAndNonEmpty(postedData.hospital)){
		this.set('ErrorMessage', 'Hospital required');
		this.redirect(questionUrl);
		return;
	}
	if(!utils.existsAndNonEmpty(postedData.questionTitle)){
		this.set('ErrorMessage', 'Question required');
		this.redirect(questionUrl);
		return;
	}

	var question = createQuestionFromPostedData(postedData);
	var q = yield questions.updateById(id, question);

	this.redirect(questionUrl);
};

function createQuestionFromPostedData(postedData){
	return {
		hospital : postedData.hospital,
		questionTitle : postedData.questionTitle,
		tags : utils.trimTags(postedData.tagString.split(',')),
		created_at : new Date
	};
};