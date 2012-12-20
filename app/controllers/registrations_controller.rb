class RegistrationsController < Devise::RegistrationsController
  
  if CONFIG['allow_registration'] == 'no'
    def new
      redirect_to root_path
    end

    def create
      redirect_to root_path
    end
  end

end