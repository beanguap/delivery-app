import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import './routelist.css';

function RouteList({ routes, currentLocation, onDelete }) {
  const [sortOrder, setSortOrder] = useState('asc');
  const [swipedRouteId, setSwipedRouteId] = useState(null);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
  };

  const sortedRoutes = useMemo(() => {
    return [...routes].sort((a, b) => {
      const distanceA = calculateDistance(currentLocation[0], currentLocation[1], a.latitude, a.longitude);
      const distanceB = calculateDistance(currentLocation[0], currentLocation[1], b.latitude, b.longitude);
      return sortOrder === 'asc' ? distanceA - distanceB : distanceB - distanceA;
    });
  }, [routes, currentLocation, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleTouchStart = (routeId, e) => {
    setSwipedRouteId(routeId);
    e.currentTarget.style.transition = ''; // Reset transition to allow smooth dragging
  };

  const handleTouchMove = (routeId, e) => {
    if (swipedRouteId !== routeId) return;
    const touch = e.touches[0];
    const movementX = touch.clientX - e.currentTarget.getBoundingClientRect().left;

    if (movementX < 0) {
      e.currentTarget.style.transform = `translateX(${movementX}px)`;
    }
  };

  const handleTouchEnd = (routeId, e) => {
    const touchElement = e.currentTarget;
    const movementX = parseFloat(touchElement.style.transform.slice(11, -3));
    const threshold = -touchElement.offsetWidth / 3;

    touchElement.style.transition = 'transform 0.3s ease'; // Smooth transition for resetting position

    if (movementX < threshold) {
      touchElement.style.transform = 'translateX(-80px)';
      touchElement.classList.add('swiped');
    } else {
      touchElement.style.transform = 'translateX(0)';
      touchElement.classList.remove('swiped');
    }

    setSwipedRouteId(null);
  };

  return (
    <div className="route-list-container">
      <h3>Routes (Closest to Farthest)</h3>
      <button onClick={toggleSortOrder} className="sort-button">
        Sort {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
      </button>
      <div className="route-list">
        {sortedRoutes.map((route, index) => (
          <div
            key={index}
            className="route-item-wrapper"
            onTouchStart={(e) => handleTouchStart(route.id, e)}
            onTouchMove={(e) => handleTouchMove(route.id, e)}
            onTouchEnd={(e) => handleTouchEnd(route.id, e)}
          >
            <div className="route-item">
              <p>{route.name}</p>
              <p>{route.street}</p>
              <p>{`${route.city}, ${route.state} ${route.zipCode}`}</p>
              <p>{route.country}</p>
            </div>
            <div className="delete-button" onClick={() => onDelete(route.id)}>Delete</div>
          </div>
        ))}
      </div>
    </div>
  );
}

RouteList.propTypes = {
  routes: PropTypes.array.isRequired,
  currentLocation: PropTypes.arrayOf(PropTypes.number).isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default RouteList;
