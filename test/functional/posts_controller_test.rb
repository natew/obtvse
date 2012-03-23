require 'test_helper'

class PostsControllerTest < ActionController::TestCase
  
  def test_anyone_can_list_the_posts
    get :index
    assert_response :ok
  end
  
  def test_spies_cannot_spy_by_listing_drafts
    get :index
    assert_response :ok
  end
  
  def test_spies_cannot_use_the_admin_list
    get :admin
    assert_response :unauthorized
  end
  
  def test_anyone_can_read_a_post
    get :show, slug: 'codename-obtvse'
    assert_response :ok
  end
  
  def test_spies_cannot_spy_by_reading_drafts
    get :show, slug: 'a-modest-proposal'
    assert_response :not_found
  end
  
  def test_haters_cannot_hate
    delete :destroy, slug: 'codename-obtvse'
    assert_response :unauthorized
  end
  
  def test_haters_cannot_even_try_to_hate
    delete :destroy, slug: 'thats-not-even-a-real-post'
    assert_response :unauthorized
  end
  
  def test_vandals_cannot_vandalize_by_updating
    put :update, slug: 'codename-obtvse', content: 'all your base are belong to us'
    assert_response :unauthorized
  end
  
  def test_vandals_cannot_vandalize_by_creating
    post :create, slug: 'im-with-stupid', content: 'again, all your base are belong to us'
    assert_response :unauthorized
  end
  
end
