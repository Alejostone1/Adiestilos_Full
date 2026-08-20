/**
 * @file NewsletterSection.jsx
 * @brief Componente para la sección de suscripción al boletín.
 *
 * Muestra un banner para suscribirse al boletín de noticias.
 */

import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

const NewsletterSection = () => {
  return (
    <Container className="py-5">
      <Row className="align-items-center bg-dark text-white rounded p-5">
        <Col md={8}>
          <h3>¡Suscríbete a nuestro boletín!</h3>
          <p className="mb-0">Recibe ofertas exclusivas y sé el primero en conocer nuestras novedades.</p>
        </Col>
        <Col md={4} className="text-md-end mt-3 mt-md-0">
          <Button variant="warning" size="lg">Suscribirme</Button>
        </Col>
      </Row>
    </Container>
  );
};

export default NewsletterSection;
