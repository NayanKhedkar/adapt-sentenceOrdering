define(function(require) {
    var QuestionView = require('coreViews/questionView'),
        Adapt = require('coreJS/adapt'),
        SortableLib = require('components/adapt-sentenceOrdering/js/sortable');
    var SentenceOrdering = QuestionView.extend({
        events: {
        },
        setupQuestion: function() {
            this.listenTo(Adapt, 'device:resize', this.resizeItems, 200);
            this.setupRandomisation();
        },
        setupRandomisation: function() {
            if (this.model.get('_isRandom')) {
                this.model.set("_shuffleItems", _.shuffle(this.model.get("_items")));
            } else {
                this.model.set("_shuffleItems", this.model.get("_items"));
            }
        },

        onQuestionRendered: function() {
            this.model.set('_sortableItems', this.$('#sortable').html());
            this.setReadyStatus();
            this.sortSentenceInitialize();
            this.setHeight();
            this.resizeItems();
            if(!this.model.get('_isPrefixTitle'))this.$('.sentence-container').width('100%');
        },

        sortSentenceInitialize: function(event) {
            var self = this;
            if (event && event.preventDefault) {
                event.preventDefault();
            }
            this.$("#sortable").sortable().on('sortable:activate', function(event, ui) {
                $(ui.item).css({
                    'z-index': '1000'
                });
            }).on('sortable:deactivate', function(event, ui) {
                $(ui.item).css({
                    'z-index': '0'
                });
                self.setDefaultHeight();
            }).on('sortable:change', function(event, ui) {
                $("li.placeholder").css('height', ui.item.height() + 'px');
            });
        },
        setDefaultHeight: function() {
            var sentenceOrderingContainers = this.$('.prefixTitle ,.sentenceSequence');
            sentenceOrderingContainers.css({
                'height': 'auto'
            });
            this.setHeight();
        },
        setHeight: function() {
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
        },
        resizeItems: function() {
            if (this.model.get("_shouldScale")) {
                var $el = this.$("#innerWrapper"),
                    elHeight = $el.outerHeight(),
                    elWidth = $el.outerWidth(),
                    $wrapper = this.$('#scaleableWrapper');

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
        },
        disableQuestion: function() {
            this.$("#sortable").sortable('disable');
        },
        enableQuestion: function() {
            this.$("#sortable").sortable('enable');
        },
        canSubmit: function() {
            return true;
        },
        onSubmitted: function() {
            var numberOfIncorrectAnswers = this.model.get('_numberOfIncorrectAnswers');
            var attemptsLeft = this.model.get('_attemptsLeft');
            if (attemptsLeft !== 0 && numberOfIncorrectAnswers > 0)
                this.$('.sentenceSequence').addClass('incorrect-resettable');
        },
        storeUserAnswer: function() {
            var listElements = this.$(".sentenceSequence"),
                userAnswer = [];
            _.each(listElements, function(item, index) {
                userAnswer.push({
                    'id': parseInt(item.id)
                });
            });
            this.model.set({
                '_userAnswerListElement': listElements,
                '_userAnswer': userAnswer
            });
        },
        showCorrectAnswer: function() {
            var listElements = [],
                cloneElement = this.$("#sortable li").clone();
            cloneElement.sort(function(firstEle, secondEle) {
                return parseInt(firstEle.id) - parseInt(secondEle.id);
            }).each(function() {
                listElements.push(this)
            });
            this.$('#sortable').html(listElements);
            this.setDefaultHeight();
        },
        hideCorrectAnswer: function() {
            this.$('#sortable').html(this.model.get('_userAnswerListElement'));
            this.setDefaultHeight();
        },
        showMarking: function() {
            var listElements = this.model.get('_userAnswer');
            _.each(listElements, function(item, index) {
                var $item = this.$('.sentenceSequence').eq(index);
                $item.addClass(item._isCorrect ? 'correct' : 'incorrect')
            }, this);
        },
        resetQuestion: function() {
            this.model.set('_userAnswer', []);
            this.$('#sortable').html(this.model.get('_sortableItems'));
        },
        isCorrect: function() {
            var listElements = this.model.get('_userAnswer'),
                items = this.model.get("_items"),
                numberOfCorrectAnswers = 0,
                numberOfIncorrectAnswers = 0,
                isCorrect;
            _.each(listElements, function(item, index) {
                isCorrect = _.contains(items[index].position, item.id);
                if (isCorrect) {
                    numberOfCorrectAnswers++;
                    item._isCorrect = true;
                } else {
                    numberOfIncorrectAnswers++;
                }
            }, this);
            this.model.set('_numberOfCorrectAnswers', numberOfCorrectAnswers);
            this.model.set('_numberOfIncorrectAnswers', numberOfIncorrectAnswers);
            // Check if correct answers matches correct items and there are no incorrect selections
            var answeredCorrectly = (numberOfCorrectAnswers === items.length) && (numberOfIncorrectAnswers === 0);
            return answeredCorrectly;
        }
    });
    Adapt.register("sentenceOrdering", SentenceOrdering);
    return SentenceOrdering;
});