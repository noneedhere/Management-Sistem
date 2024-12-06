export const IsAdmin = async (req, res, next) => {
    const userRole = req.user.role
    if (userRole === 'admin') {
      next()
    } else {
      res.status(403).json({
        success: false,
        auth: false,
        message: 'Access denied. You are not an admin.',
      })
    }
  }
  
  export const IsStudent = async (req, res, next) => {
    const userRole = req.user.role
    if (userRole === 'student') {
      next()
    } else {
      res.status(403).json({
        success: false,
        auth: false,
        message: 'Access denied. You are not a student.',
      })
    }
  }
  
  export const IsRole = async (role) => {
    return async (req, res, next) => {
      const userRole = req.user.role
      if (userRole === role) {
        next()
      } else {
        res.status(403).json({
          success: false,
          auth: false,
          message: `Access denied. You are not a ${role}.`,
        })
      }
    }
  }
  