/**
 * @file Navbar.jsx
 * @brief Componente de la barra de navegación principal.
 *
 * Muestra el logo de la marca, enlaces de navegación y gestiona
 * la visualización de los botones de login/registro o el perfil
 * del usuario si está autenticado.
 */

import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const AppNavbar = () => {
  const { usuario, logout } = useAuth();

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm">
      <Container>
        {/* Branding */}
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          Adi Estilos
        </Navbar.Brand>

        {/* Botón para colapsar en móvil */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        {/* Contenido colapsable de la barra de navegación */}
        <Navbar.Collapse id="basic-navbar-nav">
          {/* Enlaces de navegación a la izquierda */}
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" exact activeClassName="active">
              Inicio
            </Nav.Link>
            <Nav.Link as={NavLink} to="/tienda" activeClassName="active">
              Tienda
            </Nav.Link>
            <Nav.Link as={NavLink} to="/nosotros" activeClassName="active">
              Nosotros
            </Nav.Link>
          </Nav>

          {/* Lógica de autenticación a la derecha */}
          <Nav>
            {usuario ? (
              // Menú desplegable para usuario autenticado
              <NavDropdown title={`Hola, ${usuario.nombres}`} id="basic-nav-dropdown">
                <NavDropdown.Item as={Link} to="/perfil">
                  Mi Perfil
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/mis-compras">
                  Mis Compras
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logout}>
                  Cerrar Sesión
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              // Botones para usuarios no autenticados
              <>
                <Button as={Link} to="/login" variant="outline-primary" className="me-2">
                  Iniciar Sesión
                </Button>
                <Button as={Link} to="/registro" variant="primary">
                  Registrarse
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
