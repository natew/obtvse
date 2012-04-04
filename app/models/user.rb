class User < ActiveRecord::Base
  authenticates_with_sorcery!
end
