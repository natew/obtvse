Obtvse::Application.routes.draw do
  resources :posts
  match '/get/:id', :to => 'posts#get'
  match '/new', :to => 'posts#new'
  put '/edit/:id', :to => 'posts#update'
  match '/edit/:id', :to => 'posts#new', :as => 'post'
  get '/:slug', :to => 'posts#show', :as => 'post'
  delete '/:slug', :to => 'posts#destroy', :as  => 'post'
  root :to => 'posts#index'
end