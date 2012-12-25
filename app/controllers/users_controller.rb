class UsersController < ApplicationController
  before_filter :require_login_unless_no_users

  def create
    @user = User.new(params[:user])

    respond_to do |format|
      if @user.save
        format.html { redirect_to admin_path, notice: 'Welcome!' }
      else
        format.html { render action: 'new' }
      end
    end
  end

  private

  def require_login_unless_no_users
    require_login unless no_users?
  end

end
