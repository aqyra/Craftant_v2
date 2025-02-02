import Axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import CheckoutSteps from '../components/CheckoutSteps';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import { Store } from '../Store';
import { getError } from '../utils';
import { toast } from 'react-toastify';
import LoadingBox from '../components/LoadingBox';


const reducer = (state, action) => {
  switch(action.type) {
    case 'CREATE_REQUEST':
      return { ...state, loading: true };
    case 'CREATE_SUCCESS':
      return { ...state, loading: false };
    case 'CREATE_FAIL':
      return { ...state, loading: false };
    default:
      return state;
  }
}

export default function PlaceOrderScreen() {
  const navigate = useNavigate();

  const [{loading}, dispatch] = useReducer(reducer, {
    loading: false,
  });
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const roundTo = (num) => Math.round(num*100+Number.EPSILON) / 100; // rounds decimals to 2dp

  cart.itemsPrice = roundTo(
    cart.cartItems.reduce((a, c) => a+c.quantity*c.price, 0)
  );

  cart.shippingPrice = cart.itemsPrice > 100 ? roundTo(0) : roundTo(10);
  cart.totalPrice = cart.itemsPrice + cart.shippingPrice;

  const placeOrderHandler = async() => {
    try {
      dispatch({type: 'CREATE_REQUEST'});
      const { data } = await Axios.post(
        '/api/orders',
        {
          orderItems: cart.cartItems,
          shippingAddress: cart.shippingAddress,
          shippingPrice: cart.shippingPrice,
          paymentMethod: cart.paymentMethod,
          itemsPrice: cart.itemsPrice,
          totalPrice: cart.totalPrice,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      ctxDispatch({type: 'CART_CLEAR'});
      dispatch({type: 'CREATE_SUCCESS'});
      localStorage.removeItem('cartItems');
      navigate(`/order/${data.order._id}`);
    } catch(err) {
      dispatch({type: 'CREATE_FAIL'});
      toast.error(getError(err));
    }
  };


  return (
    <div>
      <CheckoutSteps step1 step2 step3 step4></CheckoutSteps>
      <Helmet>
        <title>Preview Order</title>
      </Helmet>
      <h1 className="my-3 della-font-headers">Preview Order</h1>
      <Row>
        <Col md={8}>
          <Card className="mb-3" id="card-2">
            <Card.Body>
              <Card.Title>Shipping</Card.Title> 
              <Card.Text>
                <strong>Name:</strong> {cart.shippingAddress.fullName} <br />
                <strong>Address:</strong> {cart.shippingAddress.address},
                {cart.shippingAddress.city}, {cart.shippingAddress.postalCode},
                {cart.shippingAddress.country}
              </Card.Text>
              <Link to="/shipping">Edit Shipping</Link>
            </Card.Body>
          </Card>
          <Card className="mb-3" id="card-2">
            <Card.Body>
              <Card.Title>Payment</Card.Title>
              <Card.Text>
                <strong>Method:</strong> {cart.paymentMethod}
              </Card.Text>
              <Link to="/payment">Edit Payment</Link>
            </Card.Body>
          </Card>
          <Card className="mb-3" id="card-2">
            <Card.Body>
              <Card.Title>Items</Card.Title>
                <ListGroup variant="flush">
                  {cart.cartItems.map((item) => (
                    <ListGroup.Item key={item._id}>
                      <Row className="align-items-center">
                        <Col md={6}>
                          <img src={item.image} alt={item.name} className="img-fluid rounded img-thumbnail"></img>{' '}
                          <Link to={`/product/${item.slug}`}>{item.name}</Link>
                        </Col>
                        <Col md={2}>
                          <span>{item.quantity}</span>
                        </Col>
                        <Col md={2}>
                          ${item.price*item.quantity}
                        </Col>
                        <Col md={2}>
                          {item.shop}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              <Link to="/cart">Edit Cart</Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card id="card-2">
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Items</Col>
                    <Col>${cart.itemsPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Shipping</Col>
                    <Col>${cart.shippingPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col><strong>Order Total</strong></Col>
                    <Col><strong>${cart.totalPrice.toFixed(2)}</strong></Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                    <div className="d-grid">
                      <Button type="button" onClick={placeOrderHandler} disabled={cart.cartItems.length === 0}>Place Order</Button>
                    </div>
                    {loading && <LoadingBox />}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
