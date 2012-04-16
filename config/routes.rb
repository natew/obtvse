Obtvse::Application.routes.draw do
  resources :posts
  match '/admin', :to => 'posts#new'
  match '/get/:id', :to => 'posts#get'
  match '/new', :to => 'posts#new'
  post '/edit/:id', :to => 'posts#update'
  put '/edit/:id', :to => 'posts#update'
  get '/edit/:id', :to => 'posts#new', :as => 'post'
  get '/:slug', :to => 'posts#show', :as => 'post'
  root :to => 'posts#index'
end