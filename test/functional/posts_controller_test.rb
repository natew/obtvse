require 'test_helper'

class PostsControllerTest < ActionController::TestCase

  # Redefine authenticate for this request.  Useful for stubbing
  # out authentication behavior that you may not want to test.
  def as_an_admin
    def @controller.authenticate
      session[:admin] = true
    end
  end
  
  def valid_post_attributes
    {
      slug: 'a-tale-of-two-cities',
      title: 'A Tale of Two Cities',
      content: 'It was the best of times',
      draft: false
    }
  end
  
  def test_anyone_can_list_the_posts
    get :index
    published = posts('codename-obtvse')
    assert assigns(:posts).include?(published), 'Posts should include published posts'
    assert_response :ok
  end
  
  def test_spies_cannot_spy_by_listing_drafts
    get :index
    draft = posts('a-modest-proposal')
    assert ! assigns(:posts).include?(draft), 'Posts should not include drafts'
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
  
  def test_admin_can_get_the_admin_action
    as_an_admin
    get :admin
    assert_response :ok
  end
  
  def test_admin_can_new_a_post
    as_an_admin
    get :new
    assert_response :ok
  end
  
  def test_admin_can_create_a_post
    as_an_admin
    post :create, { post: valid_post_attributes }
    assert_response :redirect
  end
  
  def test_admin_can_edit_a_post
    as_an_admin
    post = posts('a-modest-proposal')
    get :edit, id: post.id
    assert_response :ok
  end
  
  def test_admin_can_update_a_post
    as_an_admin
    put :update, { slug: 'a-modest-proposal', content: 'It is a melancholy object to those, who walk through this great town, or travel in the country' }
    assert_response :redirect
  end
  
  def test_admin_can_delete_a_post
    as_an_admin
    delete :destroy, slug: 'a-modest-proposal'
    assert_response :found
  end
    
end
