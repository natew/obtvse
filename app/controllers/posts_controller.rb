class PostsController < ApplicationController
  def index
    @posts = Post.where(draft:false).order('created_at desc').page(params[:page]).per(10)

    respond_to do |format|
      format.html
      format.xml { render :xml => @posts }
      format.rss { render :layout => false }
    end
  end

  def show
    @single_post = true
    @post = admin? ? Post.find_by_slug!(params[:slug]) : Post.find_by_slug_and_draft!(params[:slug],false)

    respond_to do |format|
      if @post.present?
        format.html
        format.xml { render :xml => @post }
      else
        format.any { render :status => 404  }
      end
    end
  end

  private

  def admin?
    session[:admin] == true
  end
end
