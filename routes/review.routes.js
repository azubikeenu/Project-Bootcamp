const router = require('express').Router({ mergeParams: true });

const { getReviews, getReview, createReview, updateReview, deleteReview } =
  require('../controllers').ReviewController;
const { authMiddleWare } = require('../middlewares');

router
  .route('/')
  .get(getReviews)
  .post(
    authMiddleWare.protect,
    authMiddleWare.restrictTo('user', 'admin'),
    createReview
  );
router
  .route('/:id')
  .get(getReview)
  .put(
    authMiddleWare.protect,
    authMiddleWare.restrictTo('user', 'admin'),
    updateReview
  )
  .delete(
    authMiddleWare.protect,
    authMiddleWare.restrictTo('user', 'admin'),
    deleteReview
  );

module.exports = router;
