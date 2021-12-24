import Adapt from 'core/js/adapt';
import QuestionView from 'core/js/views/questionView';
import SortableLib from 'libraries/sortable';

export default class SentenceOrderingView extends QuestionView {


    //method for setting up questions before rendering
    setupQuestion() {
        this.listenTo(Adapt, 'device:resize', this.resizeItems, 200);
        this.model.setupRandomisation();
    }

    // methods  after the question is rendered
    onQuestionRendered() {
        this.setReadyStatus();
        this.setHeight();
        this.resizeItems();
        this.showMarking();
        if (!this.model.get('_isPrefixTitle')) this.$('.sentence-container').width('100%');
        //first time html structure
        this.model.set('_sentenceListHtml', this.$("ul[data-id='sortable']").html());
        this.model.set('_sentenceListJqueryObject', this.$("ul[data-id='sortable']"));
        this.sortSentenceInitialize();
    }

    sortSentenceInitialize(event) {
        if (this.model.get("_isSubmitted")) return;
        var self = this;
        if (event && event.preventDefault) {
            event.preventDefault();
        }
        this.model.get('_sentenceListJqueryObject').sortable().on('sortable:activate', function (event, ui) {
            $(ui.item).css({
                'z-index': '1000',
            });
        }).on('sortable:deactivate', function (event, ui) {
            $(ui.item).css({
                'z-index': '0'
            });
            self.setDefaultHeight();
        }).on('sortable:change', function (event, ui) {
            $("li.placeholder").css('height', ui.item.height() + 'px');
        });
    }

    setDefaultHeight() {
        var sentenceOrderingContainers = this.$('.prefixTitle ,.sentenceSequence');
        sentenceOrderingContainers.css({
            'height': 'auto'
        });
        this.setHeight();
    }

    setHeight() {
        var prefix = this.$('.prefixTitle'),
            sentence = this.$('.sentenceSequence'),
            prefixHeight,
            sentenceHeight;
        for (var i = 0, length = prefix.length; i < length; i++) {
            prefixHeight = prefix.eq(i).height();
            sentenceHeight = sentence.eq(i).height();
            if (!(prefixHeight === sentenceHeight)) {
                if (prefixHeight > sentenceHeight) {
                    sentence.eq(i).css({
                        'height': prefixHeight
                    });
                } else {
                    prefix.eq(i).css({
                        'height': sentenceHeight
                    });
                }
            }
        }
    }

    resizeItems() {
        if (this.model.get("_shouldScale")) {
            var $el = this.$("div[data-id='innerWrapper']"),
                elHeight = $el.outerHeight(),
                elWidth = $el.outerWidth(),
                $wrapper = this.$("div[data-id='scaleableWrapper']");

            function doResize(event, ui) {
                var scale, heightFactor;
                scale = Math.min(
                    ui.size.width / elWidth,
                    ui.size.height / elHeight
                );
                if (scale > 1) {
                    scale = 1;
                }
                $el.css({
                    '-ms-transform': 'scale(' + scale + ')',
                    '-moz-transform': 'scale(' + scale + ')',
                    '-webkit-transform': 'scale(' + scale + ')',
                    '-webkit-transform-style': 'preserve-3d',
                    '-webkit-transform': 'scale3d(' + scale + ',' + scale + ',' + scale + ')',
                    'transform': 'scale(' + scale + ')'
                }).attr('zoom', scale);
                $el.height(this.$('.sentence-container').height() * scale);
            }
            var starterData = {
                size: {
                    width: $wrapper.width(),
                    height: $wrapper.height()
                }
            };
            doResize(null, starterData);
        } else {
            this.setDefaultHeight();
        }
    }

    disableQuestion() {
        this.model.get('_sentenceListJqueryObject').sortable('disable');
    }

    enableQuestion() {
        this.model.get('_sentenceListJqueryObject').sortable('enable');
    }

    // Blank method to add functionality for when the user cannot submit
    // Could be used for a popup or explanation dialog/hint
    onCannotSubmit() { }

    onSubmitted() {
        var numberOfIncorrectAnswers = this.model.get('_numberOfIncorrectAnswers');
        var attemptsLeft = this.model.get('_attemptsLeft');
        if (attemptsLeft !== 0 && numberOfIncorrectAnswers > 0)
            this.model.get('_sentenceListJqueryObject').children('li').removeClass('correct incorrect').addClass('incorrect-resettable');
    }

    // This is important and should give the user feedback on how they answered the question
    // Normally done through ticks and crosses by adding classes
    showMarking() {
        if (!this.model.get('_canShowMarking') || !this.model.get('_isSubmitted')) return;
        var $sentences = this.$('.sentenceSequence');
        _.each(this.model.get('isItemOnCorrectPlace'), function (isCorrectItem, index) {
            var $item = $sentences.eq(index);
            $item.removeClass('correct incorrect').addClass(isCorrectItem ? 'correct' : 'incorrect')
        }, this);
    }

    showCorrectAnswer() {
        var listElements = [],
            cloneElement = this.model.get('_sentenceListJqueryObject').children().clone();
        cloneElement.sort(function (firstEle, secondEle) {
            return parseInt(firstEle.dataset.itemid) - parseInt(secondEle.dataset.itemid);
        }).each(function () {
            listElements.push(this)
        });
        this.model.get('_sentenceListJqueryObject').html(listElements);
        this.setDefaultHeight();
    }

    hideCorrectAnswer() {
        this.model.get('_sentenceListJqueryObject').html(this.model.get('userSortedList') || this.model.get('_sentenceListHtml'));
        this.setDefaultHeight();
    }

    // Used by the question view to reset the look and feel of the component.
    resetQuestion() {
        //this.model.resetItems();
        if (this.model.get('_sentenceListHtml'))
            this.model.get('_sentenceListJqueryObject').html(this.model.get('_sentenceListHtml'));
    }

};
