import {Component} from 'react'
import Loader from 'react-loader-spinner'
import {BsPlusSquare, BsDashSquare} from 'react-icons/bs'
import Cookies from 'js-cookie'
import Header from '../Header'
import ProductCard from '../ProductCard'
import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class ProductItemDetails extends Component {
  state = {
    apiStatus: apiStatusConstants.initial,
    productItemsDataInState: null,
    similarProducts: [],
    productCartCount: 1,
  }

  componentDidMount() {
    this.getData()
  }

  getData = async () => {
    this.setState({apiStatus: apiStatusConstants.inProgress})

    const getToken = Cookies.get('jwt_token')
    if (!getToken) {
      console.log('No Token Found')
      return
    }

    const {match} = this.props
    const {id} = match.params
    const productDetailsApiUrl = `https://apis.ccbp.in/products/${id}`

    const options = {
      method: 'GET',
      headers: {Authorization: `Bearer ${getToken}`},
    }

    try {
      const response = await fetch(productDetailsApiUrl, options)

      if (response.ok) {
        const data = await response.json()
        const updatedProductData = {
          availability: data.availability,
          brand: data.brand,
          description: data.description,
          id: data.id,
          imageUrl: data.image_url,
          price: data.price,
          rating: data.rating,
          style: data.style,
          title: data.title,
          totalReviews: data.total_reviews,
        }

        const updatedSimilarProducts = data.similar_products.map(eachItem => ({
          availability: eachItem.availability,
          brand: eachItem.brand,
          description: eachItem.description,
          id: eachItem.id,
          imageUrl: eachItem.image_url,
          price: eachItem.price,
          rating: eachItem.rating,
          style: eachItem.style,
          title: eachItem.title,
          totalReviews: eachItem.total_reviews,
        }))

        this.setState({
          apiStatus: apiStatusConstants.success,
          productItemsDataInState: updatedProductData,
          similarProducts: updatedSimilarProducts,
        })
      } else {
        this.setState({apiStatus: apiStatusConstants.failure})
      }
    } catch (error) {
      console.log('Fetch Error:', error)
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  increaseProductCartCount = () => {
    this.setState(prevState => ({
      productCartCount: prevState.productCartCount + 1,
    }))
  }

  decreaseProductCartCount = () => {
    this.setState(prevState => ({
      productCartCount:
        prevState.productCartCount > 1 ? prevState.productCartCount - 1 : 1,
    }))
  }

  renderLoadingView = () => (
    <div data-testid="loader" className="primedeals-loader-container">
      <Loader type="ThreeDots" color="#0b69ff" height="50" width="50" />
    </div>
  )

  handleContinueShopping = () => {
    const {history} = this.props
    history.replace('/products')
  }

  renderFailureView = () => (
    <div className="failure-view">
      <img
        src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-error-view-img.png"
        alt="failure view"
        className="failer-view-img"
      />
      <h1>Product Not Found</h1>
      <button onClick={this.handleContinueShopping}>Continue Shopping</button>
    </div>
  )

  renderProductItem = () => {
    const {productItemsDataInState, productCartCount, similarProducts} =
      this.state

    if (!productItemsDataInState) return null

    return (
      <div className="main-container">
        <div className="main-product-details">
          <div className="product-details-image-container">
            <img
              src={productItemsDataInState.imageUrl}
              alt="product"
              className="product-details-image"
            />
          </div>
          <div className="product-details-content">
            <h1>{productItemsDataInState.title}</h1>
            <p>Rs {productItemsDataInState.price}/-</p>
            <div>
              <p>
                <img
                  src="https://assets.ccbp.in/frontend/react-js/star-img.png"
                  alt="star"
                />{' '}
                {productItemsDataInState.rating}
              </p>
              <p>({productItemsDataInState.totalReviews} Reviews)</p>
            </div>
            <p>{productItemsDataInState.description}</p>
            <p>
              <strong>Available:</strong> {productItemsDataInState.availability}
            </p>
            <p>
              <strong>Brand:</strong> {productItemsDataInState.brand}
            </p>
            <div className="cart-quantity-container">
              <button
                className="product-details-buttons"
                data-testid="minus"
                onClick={this.decreaseProductCartCount}
              >
                <BsDashSquare />
              </button>
              <p>{productCartCount}</p>
              <button
                data-testid="plus"
                onClick={this.increaseProductCartCount}
                className="product-details-buttons"
              >
                <BsPlusSquare />
              </button>
            </div>
            <button>ADD TO CART</button>
          </div>
        </div>
        <div className="similar-products-container">
          <h2>Similar Products</h2>
          <ul className="products-list">
            {similarProducts.map(eachItem => (
              <ProductCard
                key={eachItem.id}
                productData={eachItem}
                imgAltPrefix="similar product"
              />
            ))}
          </ul>
        </div>
      </div>
    )
  }

  render() {
    const {apiStatus} = this.state

    switch (apiStatus) {
      case apiStatusConstants.success:
        return (
          <>
            <Header />
            {this.renderProductItem()}
          </>
        )
      case apiStatusConstants.failure:
        return (
          <>
            <Header />
            {this.renderFailureView()}
          </>
        )
      case apiStatusConstants.inProgress:
        return this.renderLoadingView()
      default:
        return null
    }
  }
}

export default ProductItemDetails
