import React, { useEffect } from 'react'

const Callback = () => {
  useEffect(() => {
    const { ApperUI } = window.ApperSDK || {};
    if (ApperUI) {
      ApperUI.showSSOVerify("#authentication-callback");
    }
  }, []);
  
  return (
    <div id="authentication-callback"></div>
  )
}

export default Callback