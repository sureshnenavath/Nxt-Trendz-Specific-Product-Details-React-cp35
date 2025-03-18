import {Component} from 'react'
import Loader from 'react-loader-spinner'
import { FaPlusCircle, FaMinusCircle } from "react-icons/fa";
import Cookies from 'js-cookie'
import Header from '../Header'
import './index.css'
/* const updatedProductData = data[0].map(eachItem => ({
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
        })) */

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class ProductItemDetails extends Component {
  state = {
    apiStatus: apiStatusConstants.initial,
    productItemsDataInState: [],
    similarProducts: [],
    productCartCount: 1,
  }
  componentDidMount() {
    this.getData()
  }

  getData = async () => {
    this.setState({
      apiStatus: apiStatusConstants.inProgress,
    })
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
      headers: {
        Authorization: `Bearer ${getToken}`,
      },
    }

    try {
      const response = await fetch(productDetailsApiUrl, options)
      console.log('Response Status:', response.status)

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
      } else if (response.status === 401) {
        this.setState({
          apiStatus: apiStatusConstants.failure,
        })
      } else {
        this.setState({
          apiStatus: apiStatusConstants.failure,
        })
      }
    } catch (error) {
      console.log('Fetch Error:', error)
    }
  }
  renderLoadingView = () => (
    <div className="primedeals-loader-container">
      <Loader type="ThreeDots" color="#0b69ff" height="50" width="50" />
    </div>
  )
  handleContinueShopping = () => {
    const {history} = this.props
    return history.replace('/products')
  }
  renderFailureView = () => (
    <>
      <img
        src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-error-view-img.png "
        alt="error view"
        className="register-prime-image"
      />
      <button onClick={this.handleContinueShopping}>Continue Shopping</button>
    </>
  )
  increaseProductCartCount = () => {
    const {productCartCount} = this.state
    this.setState(prevState => {
      productCartCount: prevState + 1
    })
  }
  decreaseProductCartCount = () => {
    const {productCartCount} = this.state
    if (productCartCount > 0) {
      this.setState(prevState => {
        productCartCount: prevState - 1
      })
    } else {
      this.setState({productCartCount: 1})
    }
  }
  renderProductItem = () => {
    const {productItemsDataInState, productCartCount} = this.state
    return (
      <div className="main-product-details">
        <div className="product-details-image-container">
          <img
            src={productItemsDataInState.imageUrl}
            alt={productItemsDataInState.id}
            className="product-details-image"
          />
        </div>
        <div className="product-details-content">
          <h1>{productItemsDataInState.title}</h1>
          <p>{productItemsDataInState.price}</p>
          <div>
            <p>{productItemsDataInState.rating}</p>
            <p>{productItemsDataInState.totalReviews}</p>
          </div>
          <p>{productItemsDataInState.description}</p>
          <p>Available {productItemsDataInState.availability}</p>
          <p>Brand {productItemsDataInState.brand}</p>
          <div>
            <button onClick={this.increaseProductCartCount}>
              <FaPlusCircle />
            </button>
            <p>{productCartCount}</p>
            <button onClick={this.decreaseProductCartCount}>
              <FaMinusCircle />
            </button>
          </div>
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
