import Adapt from 'core/js/adapt';
import QuestionModel from 'core/js/models/questionModel';

export default class SentenceOrderingModel extends QuestionModel {

    init() {
        super.init();
    }

    restoreUserAnswers() {
        if (!this.get("_isSubmitted")) return;
        var userAnswer = this.get("_userAnswer");
        var itemArray = [];
        var items = _.sortBy(this.get("_items"));
        _.each(userAnswer, function (item, index) {
            itemArray[index] = items[item - 1];
        }, this);
        this.set("_items", itemArray);
        this.setPrefixTitle();
        this.setQuestionAsSubmitted();
        this.markQuestion();
        this.setScore();
        this.setupFeedback();
    }

    setupRandomisation() {
        this.setPrefixTitle();
        if (this.get('_isRandom') && this.get('_isEnabled')) {
            this.set("_items", _.shuffle(this.get("_items")));
        }
    }

    setPrefixTitle() {
        if (!this.get("_isPrefixTitle")) return;
        var items = _.sortBy(this.get('_items'), 'id');
        this.set("_prefixTitles", _.pluck(items, 'prefixTitle'));
    }

    // check if the user is allowed to submit the question
    canSubmit() {
        return true;

    }

    // This is important for returning or showing the users answer
    // This should preserve the state of the users answers
    storeUserAnswer() {
        var userAnswer = [];
        var tempArray = [];
        var items = _.sortBy(this.get('_items'), 'id');
        var userSortedList = this.get('_sentenceListJqueryObject').children();
        this.set("userSortedList", userSortedList);
        _.each(userSortedList, function (item, index) {
            userAnswer.push(parseInt(item.dataset.itemid));
            tempArray.push(items[parseInt(item.dataset.itemid) - 1]);
        });
        this.set({
            '_items': tempArray,
            '_userAnswer': userAnswer
        });
    }

    isCorrect() {
        var userAnswer = this.get('_userAnswer'),
            itemsSorted = _.sortBy(this.get("_items"), 'id'),
            items = this.get("_items"),
            numberOfCorrectAnswers = 0,
            numberOfIncorrectAnswers = 0,
            isItemOnCorrectPlace = [];
        _.each(userAnswer, function (item, index) {
            if (_.contains(itemsSorted[index].position, item)) {
                numberOfCorrectAnswers++;
                isItemOnCorrectPlace.push(true);
            } else {
                numberOfIncorrectAnswers++;
                isItemOnCorrectPlace.push(false);
            }
        }, this);
        this.set('isItemOnCorrectPlace', isItemOnCorrectPlace);
        this.set('_numberOfCorrectAnswers', numberOfCorrectAnswers);
        this.set('_numberOfIncorrectAnswers', numberOfIncorrectAnswers);
        // Check if correct answers matches correct items and there are no incorrect selections
        var answeredCorrectly = (numberOfCorrectAnswers === items.length) && (numberOfIncorrectAnswers === 0);
        return answeredCorrectly;
    }

    // Sets the score based upon the questionWeight
    // Can be overwritten if the question needs to set the score in a different way
    setScore() {
        var questionWeight = this.get("_questionWeight");
        var answeredCorrectly = this.get('_isCorrect');
        var score = answeredCorrectly ? questionWeight : 0;
        this.set('_score', score);
    }

    isPartlyCorrect() {
        return this.get('_numberOfCorrectAnswers') >= this.get('_items').length / 2;
    }

    resetUserAnswer() {
        this.set({ _userAnswer: [] });
    }
    /**
     * used by adapt-contrib-spoor to get the user's answers in the format required by the cmi.interactions.n.student_response data field
     * returns the user's answers as a string in the format "1,5,2"
    */
    getResponse() {
        var userAnswer = this.get('_userAnswer');
        var responses = [];
        for (var i = 0, count = userAnswer.length; i < count; i++) {
            responses.push((i + 1) + "." + (userAnswer[i])); // convert from 0-based to 1-based counting
        };
        return responses.join('#');
    }

    /**
     * Used by adapt-contrib-spoor to get the type of this question in the format required by the cmi.interactions.n.type data field
    */
    getResponseType() {
        return "matching";
    }

};
