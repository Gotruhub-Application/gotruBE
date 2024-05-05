
export function handleError(status: number=400, message:string="Failed", success:boolean=false, data:any=null,) {
    return {
        success: success,
        status: status,
        message: message,
        data: data,
    }
   
}

export function handleSuccess(status: number=200, message:string="Success", success:boolean=true, data:any=null) {
    return {
        success: success,
        status: status,
        message: message,
        data: data
    }
   
}