import request from '@arangodb/request';

export default class CloudinaryServices {

    static getPhotos(key: string) : Array<string> {
        const photos: string[] = [];
        var prefix = 'photos/' + key + '/';

        var res = request({
            method: 'GET',
            url: 'https://' + module.context.configuration.apiKey + ':' + module.context.configuration.apiSecret + '@api.cloudinary.com/v1_1/' + module.context.configuration.cloudName + '/resources/image/upload?prefix=' + prefix,
          });
        
        
        for(var i = 0; i < res.json.resources.length; i++){
            photos.push(res.json.resources[i].url);
        }
        
        return photos;

    }

    static getMaps(key: string) : Array<string> {
        const maps: string[] = [];
        var prefix = 'maps/' + key + '/';


        var res = request({
            method: 'GET',
            url: 'https://' +  module.context.configuration.apiKey + ':' + module.context.configuration.apiSecret + '@api.cloudinary.com/v1_1/' + module.context.configuration.cloudName + '/resources/image/upload?prefix=' + prefix,
          });
        
        for(var i = 0; i < res.json.resources.length; i++){
            maps.push(res.json.resources[i].url);
        }
        
        return maps;

    }


}
