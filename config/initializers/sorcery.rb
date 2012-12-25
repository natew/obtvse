Rails.application.config.sorcery.submodules = [:session_timeout, :remember_me, :reset_password, :external, :activity_logging, :brute_force_protection]

Rails.application.config.sorcery.configure do |config|
  config.session_timeout = 7.days
  config.session_timeout_from_last_action = true

  config.user_config do |user|
    user.username_attribute_names                     = [:email]

    user.reset_password_mailer                        = UserMailer
    user.reset_password_expiration_period             = 10.minutes
    user.reset_password_time_between_emails           = nil

    user.consecutive_login_retries_amount_limit       = 10
    user.login_lock_time_period                       = 2.minutes
  end

  config.user_class = User
end
