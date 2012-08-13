Obtvse::Application.routes.draw do
  match '/admin', :to => 'posts#new'
  match '/get/:id', :to => 'posts#get'
  match '/new', :to => 'posts#new'
  delete '/:id', :to => 'posts#destroy'
  post '/edit/:id', :to => 'posts#update'
  put '/edit/:id', :to => 'posts#update'
  get '/edit/:id', :to => 'posts#new', :as => 'post'
  get '/:slug', :to => 'posts#show', :as => 'post'
  resources :posts
  root :to => 'posts#index'
end