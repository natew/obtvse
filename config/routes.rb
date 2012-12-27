Obtvse::Application.routes.draw do

  # Admin
  match '/admin', to: 'posts#admin', as: 'admin'
  match '/get/:id', to: 'admin#get'

  # Authentication
  get 'logout' => 'sessions#destroy', as: 'logout'
  get 'login' => 'sessions#new', as: 'login'
  get 'signup' => 'users#new', as: 'signup'

  get '/posts(.:format)', to: 'posts#index'

  resources :users
  resources :sessions
  resources :posts, path: '/'

  get '/:slug', to: 'posts#show', as: 'post'

  # match '/new', to: 'posts#new'
  # post '/posts', to: 'admin#create'
  # post '/edit/:id', to: 'admin#update'
  # put '/edit/:id', to: 'admin#update'
  # get '/edit/:id', to: 'admin#new', as: 'post'

  root to: 'posts#index'

end