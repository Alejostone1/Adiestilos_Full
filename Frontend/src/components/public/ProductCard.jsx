/**
 * @file ProductCard.jsx
 * @brief Componente para mostrar una tarjeta de producto.
 *
 * Muestra una imagen, nombre, precio y un botón para añadir al carrito.
 */

import React from 'react';
import { Card, Button } from 'react-bootstrap';

const ProductCard = ({ producto }) => {
  return (
    <Card className="product-card h-100 shadow-sm border-0">
      <Card.Img variant="top" src={producto.img} />
      <Card.Body>
        <Card.Title>{producto.nombre}</Card.Title>
        <Card.Text>{producto.precio}</Card.Text>
      </Card.Body>
      <Card.Footer className="bg-white border-0">
        <Button variant="primary" className="w-100">Añadir al Carrito</Button>
      </Card.Footer>
    </Card>
  );
};

export default ProductCard;
