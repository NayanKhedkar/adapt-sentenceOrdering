import Adapt from 'core/js/adapt';
import SentenceOrderingView from './sentenceOrderingView';
import SentenceOrderingModel from './sentenceOrderingModel';

export default Adapt.register('sentenceOrdering', {
    model: SentenceOrderingModel,
    view: SentenceOrderingView
});
