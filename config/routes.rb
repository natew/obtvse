Obtvse::Application.routes.draw do

  get 'logout' => 'sessions#destroy', as: 'logout'
  get 'login' => 'sessions#new', as: 'login'
  get 'signup' => 'users#new', as: 'signup'
  resources :users
  resources :sessions

  # Admin
  match '/admin', to: 'admin#new', as: 'admin'
  match '/get/:id', to: 'admin#get'
  match '/new', to: 'admin#new'
  post '/posts', to: 'admin#create'
  post '/edit/:id', to: 'admin#update'
  put '/edit/:id', to: 'admin#update'
  get '/edit/:id', to: 'admin#new', as: 'post'

  # Posts
  get '/:slug', to: 'posts#show', as: 'post'
  root to: 'posts#index'

end