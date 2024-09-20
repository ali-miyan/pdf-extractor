import { Cloudinary } from 'cloudinary-core';  

const cloudinary = new Cloudinary({ cloud_name: 'dzelbiwxm' });

export function getDownloadLink(publicId:string) {  
    return cloudinary.url(publicId, {  
      resource_type: 'pdf',  
      format: 'pdf',  
      download: true,  
      transformation: [  
        { width: 800, height: 600, crop: 'fill' },  
      ],  
    });  
  }