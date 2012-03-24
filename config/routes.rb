Obtvse::Application.routes.draw do
  resources :posts
  match '/admin', to: 'posts#admin'
  match '/new', to: 'posts#new'
  match '/edit/:id', to: 'posts#edit'
  delete '/:slug', to: 'posts#destroy', as: 'post'
  put '/:slug', to: 'posts#update', as: 'post'
  get '/:slug', to: 'posts#show'
  root to: 'posts#index'
end