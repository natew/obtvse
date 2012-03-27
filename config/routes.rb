Obtvse::Application.routes.draw do
  resources :posts
  match '/admin', :to  =>'posts#admin'
  match '/new', :to  =>'posts#new'
  match '/edit/:id', :to  =>'posts#edit'
  get '/:slug', :to  =>'posts#show', :as => 'post'
  delete '/:slug', :to  =>'posts#destroy', :as  => 'post'
  put '/update/:id', :to  =>'posts#update', :as  => 'post'
  root :to  =>'posts#index'
end